import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import { openapiLogger, consoleTransport, fileTransport } from '@openapi-platform/logger';
import cors from 'cors';
import swagger from 'feathers-swagger';
import morgan from 'morgan';
import Sequelize from 'sequelize';
import { promisify } from 'util';

import {
  overrideConsoleLogger,
  overrideUtilInspectStyle,
} from '@openapi-platform/logger';
import { store, Context } from '@openapi-platform/server-addons';

import { registerAddons } from './addons/registerAddons';
import { config } from './config';

import { storeHooks } from './addons/storeHooks';
import { coreAddon } from './coreAddon';
import {
  createBlobService,
  createBlobMetadataModel,
  createBlobMetadataService,
  createBlobStore,
} from './db/blob-model';
import { connectToDb } from './db/connection';
import { createSdkConfigModel, createSdkConfigService } from './db/sdk-config-model';
import { createSdkModel, createSdkService } from './db/sdk-model';
import { createSpecModel, createSpecService } from './db/spec-model';
import { serviceAddonHookOptions } from './serviceAddonHookOptions';

// TODO: For some reason, calling this within createServer (even at the top of the function) breaks tests. Find out why
function createLogger() {
  const logger = openapiLogger()
    .add(consoleTransport(config.get('server.log.console')))
    .add(fileTransport(config.get('server.log.file')));
  logger.exceptions.handle(fileTransport(config.get('server.log.error')));
  return logger;
}

export async function createServer() {
  /* 
    c represents the openapi context. 
    It's used so often that it's been abbreviated to a single letter
  */
  const c: Context = {
    blobStore: createBlobStore(),
    logger: createLogger(),
    app: express(feathers()),
  };
  store().hooks(storeHooks);
  // Most of the core functionality in OpenAPI Platform server is written as an addon
  store().register(coreAddon);

  await registerAddons(c);
  // NOTE: Before this line, do NOT use anything in c as the addons might want to modify/replace whatever's in the context
  await store().setup(c);

  // Overriding logger used in non testing environments, logging in tests just go to stdout.
  overrideConsoleLogger(c.logger);
  overrideUtilInspectStyle();

  c.logger.info('Creating OpenAPI Platform server...');

  const dbConnection: Sequelize.Sequelize = await connectToDb(c);

  // Setup database models
  const specModel = createSpecModel(dbConnection);
  const specService = createSpecService(specModel);
  const sdkConfigModel = createSdkConfigModel(dbConnection);
  const sdkModel = createSdkModel(dbConnection);
  const blobMetadataModel = createBlobMetadataModel(dbConnection);

  // Initialise services
  const sdkConfigService = createSdkConfigService(sdkConfigModel);
  const sdkService = createSdkService(sdkModel);
  const blobMetadataService = createBlobMetadataService(blobMetadataModel);
  const blobService = createBlobService('blobMetadata', c.blobStore);

  const swaggerInfo = {
    title: 'Swagger Platform',
    description: 'Open sourced service overlay for SDK management using swagger-codegen',
  };
  c.app
    .use(
      morgan('dev', {
        stream: {
          write(message) {
            c.logger.verbose(message);
          },
        },
      }),
    )
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .configure(express.rest())
    .configure(socketio())
    .configure(
      swagger({
        docsPath: '/docs',
        uiIndex: true,
        info: swaggerInfo,
      }),
    )
    /*
      TODO: At the moment we need to use feathers-swagger twice, once to use Swagger UI,
      once for exposing the swagger JSON schema.
    */
    .configure(
      swagger({
        docsPath: '/swagger.json',
        uiIndex: false,
        info: swaggerInfo,
      }),
    )
    .get('/', (req, res) => res.redirect('/docs'))
    .use('/specifications', specService)
    .use('/sdkConfigs', sdkConfigService)
    .use('/sdks', sdkService)
    .use('/blobMetadata', blobMetadataService)
    .use('/blobs', blobService)
    .use(express.errorHandler());

  // Literally everybody gets data sent through websockets
  // TODO: If we ever add user authentication, this would be very very insecure
  c.app.on('connection', connection => c.app.channel('everybody').join(connection));
  c.app.publish(() => c.app.channel('everybody'));

  c.app.service('specifications').hooks(serviceAddonHookOptions(c, 'specifications'));
  c.app.service('sdkConfigs').hooks(serviceAddonHookOptions(c, 'sdkConfigs'));
  c.app.service('sdks').hooks(serviceAddonHookOptions(c, 'sdks'));
  async function internalUseOnlyHook(context) {
    if (context.params.provider !== undefined) {
      throw new Error(
        `${context.params.provider} providers are not allowed to access this service`,
      );
    }
  }

  // TODO: Implement addon hooks
  c.app.service('blobMetadata').hooks({
    before: {
      all: internalUseOnlyHook,
    },
  });
  // TODO: Implement addon hooks
  c.app.service('blobs').hooks({
    before: {
      all: internalUseOnlyHook,
    },
  });

  // Download route needs to be provided since the file service responds with JSON payloads
  c.app.get('/files/:id', async (req, res) => {
    const data = await c.app.service('blobs').get(req.params.id);
    res.attachment(data.metadata.name);
    res.header('Content-Type', data.metadata.contentType);
    data.stream.pipe(res);
  });

  // Enables CORS requests if configured to do so
  if (config.get('server.useCors')) {
    c.app.use(cors());
  }

  c.app.hooks({
    error(hook) {
      c.logger.error(hook.error);
    },
  });

  // TODO: Use migrations instead of sync to create tables
  await specModel.sync();
  await sdkConfigModel.sync();
  await sdkModel.sync();
  await blobMetadataModel.sync();

  // promisifys Express's listen function
  const originalAppListenFn = c.app.listen.bind(c.app);
  c.app.listen = async (...params) => {
    await store().addonHooks.before.listen(c);
    await promisify(originalAppListenFn)(...params);
    await store().addonHooks.after.listen(c);
  };

  return c;
}
