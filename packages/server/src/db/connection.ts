import Sequelize from 'sequelize';

import { Context } from '@openapi-platform/server-addons';
import { config } from '../config';

export async function connectToDb(c: Context) {
  const databaseConfig = config.get('database');
  const dbConnection = new Sequelize(
    databaseConfig.name,
    databaseConfig.username,
    databaseConfig.password,
    {
      dialect: 'postgres',
      host: databaseConfig.host,
      port: databaseConfig.port,
      logging: c.logger.verbose,
    },
  );
  try {
    await dbConnection.authenticate();
    c.logger.info('Successfully connected to database');
  } catch (err) {
    c.logger.error('Unable to connect to database: %s', err);
    throw err;
  }
  return dbConnection;
}
