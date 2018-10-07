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
        await app.service('specifications').get(context.data.specId, {});
        if (!hasValidBuildStatus(context.data.buildStatus)) {
          context.data.buildStatus = BuildStatus.NotRun;
        }
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
        const sdkConfig = await app
          .service('sdkConfigs')
          .get(context.data.sdkConfigId, {});
        const spec = await app.service('specifications').get(sdkConfig.specId, {});
        const sdk = await generateSdk(logger, spec, sdkConfig);
        /*
          TODO: The linkside of the info object is probably temporary.
          Might need to consider downloading the object from
          wherever the Swagger gen API stores it.
        */
        if (sdkConfig.gitInfo) {
          await updateRepoWithNewSdk(sdkConfig.gitInfo, sdk.path, {
            hooks: {
              clone: {
                before: async hookContext => {
                  logger.verbose(
                    `Cloning ${hookContext.remoteSdkUrl} into ${hookContext.repoDir}`,
                  );
                },
              },
              downloadSdk: {
                before: async hookContext => {
                  logger.verbose('Dowloading SDK');
                },
              },
              extractSdk: {
                before: async hookContext => {
                  logger.verbose(
                    `Extracting ${hookContext.sdkArchivePath} to ${hookContext.sdkDir}`,
                  );
                },
              },
              moveSdkFilesToRepo: {
                before: async hookContext => {
                  logger.verbose(
                    `Moving files from ${hookContext.sdkDir} to ${hookContext.repoDir}`,
                  );
                },
              },
              stage: {
                before: async hookContext => {
                  logger.verbose(`Staging ${hookContext.stagedPaths.length} paths`);
                },
              },
              commit: {
                before: async () => {
                  // Maybe state the commit message and hash
                  logger.verbose(`Committing changes`);
                },
              },
              push: {
                before: async () => {
                  logger.verbose(`Pushing commits...`);
                },
              },
            },
          });
        }
        context.data.path = sdk.path;
        context.data.sdkConfigId = sdkConfig.id;
        return context;
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
