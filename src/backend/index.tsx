import 'source-map-support/register';

import express from '@feathersjs/express';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import cors from 'cors';
import swagger from 'feathers-swagger';
import morgan from 'morgan';
import Sequelize from 'sequelize';

import { createPlanModel, createPlanService } from 'backend/db/planModel';
import { createSdkModel, createSdkService } from 'backend/db/sdkModel';
import { createSpecModel, createSpecService } from 'backend/db/specModel';
import { initDummyData } from 'backend/initDummyData';
import { logger, overrideConsoleLogger, overrideUtilInspectStyle } from 'backend/logger';
import { generateSdk } from 'client/sdkGeneration';
import { config } from 'config';
import { BuildStatus } from 'model/Plan';

overrideConsoleLogger(logger);
overrideUtilInspectStyle();

async function run(port: number) {
  logger.info('Starting Swagger Platform server...');

  // Initialise database connection
  const dbConnection = new Sequelize(
    config.backend.databaseName,
    config.backend.databaseUsername,
    config.backend.databasePassword,
    {
      dialect: 'postgres',
      host: config.backend.databaseHost,
      port: config.backend.databasePort,
      logging: logger.info,
    },
  );
  try {
    await dbConnection.authenticate();
    logger.info('Successfully connected to database');
  } catch (err) {
    logger.error('Unable to connect to database: %s', err);
    return;
  }

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
        context.data.buildStatus = BuildStatus.NotRun;
        // TODO: Will need to change this at some point
        context.data.latestVersion = 'TODO';
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
        context.data.path = sdk.path;
        context.data.planId = sdk.planId;

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
  if ((await specModel.count()) === 0) {
    // Initialise dummy data if there are no specifications
    await initDummyData(app.service('specifications'), app.service('plans'));
  }

  app.listen(port, (er, err) => {
    logger.info(`Now listening on port ${port}`);
  });
}

const envPort: string | undefined = process.env.PORT;
const appPort: number = envPort ? Number.parseInt(envPort) : config.backend.port;
run(appPort);
