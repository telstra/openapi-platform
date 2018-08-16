import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import cors from 'cors';
import swagger from 'feathers-swagger';
import morgan from 'morgan';
import Sequelize from 'sequelize';

import { createPlanModel, createPlanService } from 'backend/db/plan-model';
import { createSdkModel, createSdkService } from 'backend/db/sdk-model';
import { createSpecModel, createSpecService } from 'backend/db/spec-model';
import { updateRepoWithNewSdk } from 'backend/git';
import { initDummyData } from 'backend/initDummyData';
import { logger } from 'backend/logger';
import { generateSdk } from 'client/sdkGeneration';
import { config } from 'config';
import { BuildStatus, hasValidBuildStatus } from 'model/Plan';

export async function createServer(dbConnection: Sequelize.Sequelize) {
  // Define database model for specifications
  const specModel = createSpecModel(dbConnection);
  const specService = createSpecService(specModel);

  // Define database model for plans
  const planModel = createPlanModel(dbConnection);
  const planService = createPlanService(planModel);

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
          write: message => logger.info(message),
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
    .use('/plans', planService)
    .use('/sdks', sdkService)
    .use(express.errorHandler());

  app.service('plans').hooks({
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
        const plan = await planService.get(context.data.planId, {});
        const spec = await specService.get(plan.specId, {});
        const sdk = await generateSdk(logger, spec, plan);
        /*
        TODO: The linkside of the info object is probably temporary.
        Might need to consider downloading the object from 
        wherever the Swagger gen API stores it.
        */
        if (plan.gitInfo) {
          await updateRepoWithNewSdk(plan.gitInfo, sdk.path);
        }
        context.data.path = sdk.path;
        context.data.planId = plan.id;
        return context;
      },
    },
  });

  // Enables CORS requests if configured to do so
  if (config.backend.useCors) {
    app.use(cors());
  }

  // TODO: Use migrations instead of sync to create tables
  await specModel.sync();
  await planModel.sync();
  await sdkModel.sync();

  if (config.backend.initDummyData && (await specModel.count()) === 0) {
    // Initialise dummy data if there are no specifications
    await initDummyData(app.service('specifications'), app.service('plans'));
  }

  return app;
}
