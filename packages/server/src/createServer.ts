import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import cors from 'cors';
import swagger from 'feathers-swagger';
import morgan from 'morgan';
import fetch from 'node-fetch';
import Sequelize from 'sequelize';
import { promisify } from 'util';

import { updateRepoWithNewSdk } from '@openapi-platform/git-util';
import { BuildStatus } from '@openapi-platform/model';
import { generateSdk } from '@openapi-platform/openapi-sdk-gen-client';
import { store } from '@openapi-platform/server-addons';

import { registerAddons } from './addons/registerAddons';
import { withAddonStoreHooks } from './addons/withAddonStoreHooks';
import { config } from './config';
import {
  createBlobStore,
  createBlobService,
  createBlobMetadataModel,
  createBlobMetadataService,
} from './db/blob-model';
import { connectToDb } from './db/connection';
import { createSdkConfigModel, createSdkConfigService } from './db/sdk-config-model';
import { createSdkModel, createSdkService } from './db/sdk-model';
import { createSpecModel, createSpecService } from './db/spec-model';
import { logger } from './logger';

export async function createServer() {
  const oapipContext: any = {};
  oapipContext.blobStore = createBlobStore();
  await registerAddons();
  withAddonStoreHooks();
  logger.info('Setting up addons...');
  await store().setup(oapipContext);
  const dbConnection: Sequelize.Sequelize = await connectToDb();

  // Setup database models
  const specModel = createSpecModel(dbConnection);
  const specService = createSpecService(specModel);
  const sdkConfigModel = createSdkConfigModel(dbConnection);
  const sdkModel = createSdkModel(dbConnection);
  const blobMetadataModel = createBlobMetadataModel(dbConnection);

  // Start initialising the app
  const app = express(feathers());

  // Initialise services
  const sdkConfigService = createSdkConfigService(sdkConfigModel);
  const sdkService = createSdkService(sdkModel);
  const blobMetadataService = createBlobMetadataService(blobMetadataModel);
  const blobService = createBlobService('blobMetadata', oapipContext.blobStore);

  const swaggerInfo = {
    title: 'Swagger Platform',
    description: 'Open sourced service overlay for SDK management using swagger-codegen',
  };
  app
    .use(
      morgan('dev', {
        stream: {
          write(message) {
            logger.verbose(message);
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

  // Literally everybody gets data set
  // TODO: If we ever add user authentication, this would be very very insecure
  app.on('connection', connection => app.channel('everybody').join(connection));
  app.publish(() => app.channel('everybody'));

  app.service('specifications').hooks({
    after: {
      async remove(context) {
        // Remove any associated SDK configurations when a specification is removed
        if (Array.isArray(context.result)) {
          // For each specification, remove any associated SDK configurations
          context.result.forEach(async specification => {
            await app.service('sdkConfigs').remove(null, {
              query: { specId: specification.id },
            });
          });
        } else {
          // Only a single specification was removed
          await app.service('sdkConfigs').remove(null, {
            query: { specId: context.result.id },
          });
        }
      },
    },
  });
  app.service('sdkConfigs').hooks({
    before: {
      async create(context) {
        // Throws an error if it can't find the specification
        await app.service('specifications').get(context.data.specId, {});
        return context;
      },
    },
    after: {
      async remove(context) {
        // Remove any associated SDKs when a SDK configuration is removed
        if (Array.isArray(context.result)) {
          // For each SDK configuration, remove any associated SDKs
          context.result.forEach(async sdkConfig => {
            await app.service('sdks').remove(null, {
              query: { sdkConfigId: sdkConfig.id },
            });
          });
        } else {
          // Only a single SDK config was removed
          await app.service('sdks').remove(null, {
            query: { sdkConfigId: context.result.id },
          });
        }
      },
    },
  });
  app.service('sdks').hooks({
    before: {
      async create(context) {
        if (context.data.sdkConfigId === undefined || context.data.sdkConfigId === null) {
          throw new Error(`The sdkConfigId was ${context.data.sdkConfigId}`);
        }
        context.sdkConfig = await app.service('sdkConfigs').get(context.data.sdkConfigId);
        if (!context.sdkConfig) {
          throw new Error(`Sdk ${context.data.sdkConfigId} does not exist`);
        }
        context.data.buildStatus = BuildStatus.Building;
        return context;
      },
    },
    after: {
      async create(context) {
        try {
          const spec = await app
            .service('specifications')
            .get(context.sdkConfig.specId, {});
          logger.verbose(`Generating sdk for sdk ID ${context.result.id}...`);
          const sdkUrl = await generateSdk(logger, spec, context.sdkConfig);
          logger.verbose(`Downloading ${sdkUrl}...`);
          const sdkResponse = await fetch(sdkUrl);
          logger.verbose('Storing sdk...');
          const sdkVersion = context.sdkConfig.version;
          const sdkTarget = context.sdkConfig.target;
          const blob = await app.service('blobs').create({
            metadata: {
              // TODO: Maybe add the spec title on the start or something
              name: `${sdkTarget}${sdkVersion ? `-${sdkVersion}` : ''}.zip`,
              contentType: sdkResponse.headers.get('Content-Type'),
            },
            stream: sdkResponse.body,
          });
          await app.service('sdks').patch(context.result.id, {
            fileId: blob.metadata.id,
          });
          /*
            TODO: The linkside of the info object is probably temporary.
            Might need to consider downloading the object from
            wherever the Swagger gen API stores it.
          */
          if (context.sdkConfig.gitInfo) {
            await updateRepoWithNewSdk(context.sdkConfig.gitInfo, sdkUrl, {
              hooks: {
                before: {
                  async clone(gitHookContext) {
                    logger.verbose(
                      `Cloning ${gitHookContext.remoteSdkUrl} into ${
                        gitHookContext.repoDir
                      }`,
                    );
                    await app.service('sdks').patch(context.result.id, {
                      buildStatus: BuildStatus.Cloning,
                    });
                  },
                  async downloadSdk() {
                    logger.verbose('Dowloading SDK');
                  },
                  async extractSdk(gitHookContext) {
                    logger.verbose(
                      `Extracting ${gitHookContext.sdkArchivePath} to ${
                        gitHookContext.sdkDir
                      }`,
                    );
                  },
                  async moveSdkFilesToRepo(gitHookContext) {
                    logger.verbose(
                      `Moving files from ${gitHookContext.sdkDir} to ${
                        gitHookContext.repoDir
                      }`,
                    );
                  },
                  async stage(gitHookContext) {
                    logger.verbose(`Staging ${gitHookContext.stagedPaths.length} paths`);
                    await app.service('sdks').patch(context.result.id, {
                      buildStatus: BuildStatus.Staging,
                    });
                  },
                  async commit() {
                    // Maybe state the commit message and hash
                    logger.verbose(`Committing changes`);
                  },
                  async push() {
                    logger.verbose(`Pushing commits...`);
                    await app.service('sdks').patch(context.result.id, {
                      buildStatus: BuildStatus.Pushing,
                    });
                  },
                },
              },
            });
          }
          await app.service('sdks').patch(context.result.id, {
            buildStatus: BuildStatus.Success,
          });
        } catch (err) {
          await app.service('sdks').patch(context.result.id, {
            buildStatus: BuildStatus.Fail,
            // TODO: should include a failure error
          });
          logger.error('Failed to generate SDK', err);
        }
      },
    },
  });
  async function internalUseOnlyHook(context) {
    if (context.params.provider !== undefined) {
      throw new Error(
        `${context.params.provider} providers are not allowed to access this service`,
      );
    }
  }
  app.service('blobMetadata').hooks({
    before: {
      all: internalUseOnlyHook,
    },
  });
  app.service('blobs').hooks({
    before: {
      all: internalUseOnlyHook,
    },
  });
  // Download route needs to be provided since the file service responds with JSON payloads
  app.get('/files/:id', async (req, res) => {
    const data = await app.service('blobs').get(req.params.id);
    res.attachment(data.metadata.name);
    res.header('Content-Type', data.metadata.contentType);
    data.stream.pipe(res);
  });

  // Enables CORS requests if configured to do so
  if (config.get('server.useCors')) {
    app.use(cors());
  }

  app.hooks({
    error(hook) {
      logger.error(hook.error);
    },
  });

  // TODO: Use migrations instead of sync to create tables
  await specModel.sync();
  await sdkConfigModel.sync();
  await sdkModel.sync();
  await blobMetadataModel.sync();
  const originalAppListenFn = app.listen.bind(app);
  app.listen = async (...params) => {
    await store().addonHooks.before.listen({});
    await promisify(originalAppListenFn)(...params);
    await store().addonHooks.after.listen({});
  };
  return app;
}
