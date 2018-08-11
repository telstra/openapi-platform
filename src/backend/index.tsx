import 'source-map-support/register';

import Sequelize from 'sequelize';

import { logger, overrideConsoleLogger, overrideUtilInspectStyle } from 'backend/logger';
import { createServer } from 'backend/server';
import { config } from 'config';

import 'source-map-support/register';

async function run(port: number) {
  // Overriding logger used in non testing environments, logging in tests just go to stdout.
  overrideConsoleLogger(logger);
  overrideUtilInspectStyle();
  logger.info('Creating OpenAPI Platform server...');

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

  const app = await createServer(dbConnection);

  app.listen(port, (er, err) => {
    logger.info(`OpenAPI Platform Server now listening on port ${port}`);
  });
  return app;
}

const envPort: string | undefined = process.env.PORT;
const appPort: number = envPort ? Number.parseInt(envPort, 10) : config.backend.port;
run(appPort);
