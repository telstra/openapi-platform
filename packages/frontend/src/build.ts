import webpack from 'webpack';
import createWebpackConfig from '../webpack.config';

import { readConfig } from '@openapi-platform/config';
import { openapiLogger } from '@openapi-platform/logger';

export async function build({ ...webpackOptions } = {}) {
  const logger = openapiLogger();
  logger.info('Bundling frontend app...');

  const openapiConfig = readConfig();
  const webpackInputs = {
    OUTPUT_PATH: process.cwd(),
    STATS_DIRNAME: null,
    API_PORT: openapiConfig.get('server.port'),
    NODE_ENV: openapiConfig.get('env'),
    ...webpackOptions,
  };
  const webpackConfig = createWebpackConfig(webpackInputs);

  return await new Promise((resolve, reject) => {
    try {
      webpack(webpackConfig, error => {
        if (error) {
          reject(error);
        } else {
          resolve(webpackConfig.output.path);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
