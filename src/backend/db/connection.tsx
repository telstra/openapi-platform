import Sequelize from 'sequelize';
import { config } from 'config';
import { logger } from 'backend/logger';

export async function connectToDb() {
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
    throw err;
  }
  return dbConnection;
}
