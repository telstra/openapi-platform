import Sequelize from 'sequelize';

import { config } from '../config';
import { logger } from '../logger';

export async function connectToDb() {
  const databaseConfig = config.get('database');
  const dbConnection = new Sequelize(
    databaseConfig.name,
    databaseConfig.username,
    databaseConfig.password,
    {
      dialect: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      logging: logger.verbose,
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
