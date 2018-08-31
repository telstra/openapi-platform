import webpack from 'webpack';
import createWebpackConfig from '../webpack.config';

import { readConfig } from '@openapi-platform/config';
import { openapiLogger } from '@openapi-platform/logger';

export async function build({ ...webpackOptions } = {}) {
  const logger = openapiLogger();
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
