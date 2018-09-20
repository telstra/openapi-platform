import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import cors from 'cors';
import swagger from 'feathers-swagger';
import morgan from 'morgan';
import Sequelize from 'sequelize';

import { updateRepoWithNewSdk } from '@openapi-platform/git-util';
import { BuildStatus, hasValidBuildStatus } from '@openapi-platform/model';
import { generateSdk } from '@openapi-platform/openapi-sdk-gen-client';
import { logger } from './logger';

import { connectToDb } from './db/connection';
import { createSdkConfigModel, createSdkConfigService } from './db/sdk-config-model';
import { createSdkModel, createSdkService } from './db/sdk-model';
import { createSpecModel, createSpecService } from './db/spec-model';

import { config } from './config';

export async function createServer() {
  const dbConnection: Sequelize.Sequelize = await connectToDb();

  // Define database model for specifications
  const specModel = createSpecModel(dbConnection);
  const specService = createSpecService(specModel);

  // Define database model for SDK configurations
  const sdkConfigModel = createSdkConfigModel(dbConnection);
  const sdkConfigService = createSdkConfigService(sdkConfigModel);

  // Define database model for SDKs
  const sdkModel = createSdkModel(dbConnection);
  const sdkService = createSdkService(sdkModel);

  // Configure Express
  const app = express(feathers());
  const swaggerInfo = {
    title: 'Swagger Platform',
    description: 'Open sourced service overlay for SDK management using swagger-codegen',
  };
  app
    .use(
      morgan('dev', {
        stream: {
          write: message => logger.verbose(message),
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
    .use(express.errorHandler());

  app.service('sdkConfigs').hooks({
    before: {
      async create(context) {
        await specService.get(context.data.specId, {});
        if (!hasValidBuildStatus(context.data.buildStatus)) {
          context.data.buildStatus = BuildStatus.NotRun;
        }
        return context;
      },
    },
  });
  app.service('sdks').hooks({
    before: {
      async create(context) {
        const sdkConfig = await sdkConfigService.get(context.data.sdkConfigId, {});

        // Update the SDK build config.
        sdkConfig.buildStatus = BuildStatus.Running;
        await sdkConfigService.update(sdkConfig.id, sdkConfig, {});

        const spec = await specService.get(sdkConfig.specId, {});

        try {
          const sdk = await generateSdk(logger, spec, sdkConfig);
          /*
          TODO: The linkside of the info object is probably temporary.
          Might need to consider downloading the object from
          wherever the Swagger gen API stores it.
          */
          if (sdkConfig.gitInfo) {
            await updateRepoWithNewSdk(sdkConfig.gitInfo, sdk.path, { logger });
          }

          // Create the built SDK.
          context.data.path = sdk.path;
          context.data.sdkConfigId = sdkConfig.id;
          context.data.buildStatus = BuildStatus.Success;
        } catch (error) {
          context.data.sdkConfigId = sdkConfig.id;
          context.data.buildStatus = BuildStatus.Fail;
        }
        return context;
      },
    },
    after: {
      async create(context) {
        const sdkConfig = await sdkConfigService.get(context.data.sdkConfigId, {});
        sdkConfig.buildStatus = BuildStatus.Success;
      },
    },
    error: {
      async create(context) {
        const sdkConfig = await sdkConfigService.get(context.data.sdkConfigId, {});
        sdkConfig.buildStatus = BuildStatus.Fail;
        await sdkConfigService.update(sdkConfig.id, sdkConfig, {});
      },
    },
  });

  // Enables CORS requests if configured to do so
  if (config.get('server.useCors')) {
    app.use(cors());
  }

  // TODO: Use migrations instead of sync to create tables
  await specModel.sync();
  await sdkConfigModel.sync();
  await sdkModel.sync();

  return app;
}
