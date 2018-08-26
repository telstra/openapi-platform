import { readConfig } from '@openapi-platform/config';
import webpack from 'webpack';
import createWebpackConfig from '../webpack.config';
import { logger } from './logger';

export async function build({ ...webpackOptions } = {}) {
  logger.info('Bundling frontend app...');

  const openapiConfig = readConfig();
  const webpackConfig = createWebpackConfig({
    OUTPUT_PATH: process.cwd(),
    STATS_DIRNAME: null,
    API_PORT: openapiConfig.get('server.port'),
    NODE_ENV: openapiConfig.get('env'),
    ...webpackOptions,
  });

  return await new Promise((resolve, reject) => {
    try {
      webpack(webpackConfig, error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
