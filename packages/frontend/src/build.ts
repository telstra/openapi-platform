import webpack from 'webpack';

import { uiUrl } from '@openapi-platform/config';

import createWebpackConfig from '../webpack.config';
import { logger } from './logger';
import { config } from './config';

export async function build({ ...webpackOptions } = {}) {
  logger.info('Bundling frontend app...');

  const webpackInputs = {
    OUTPUT_PATH: process.cwd(),
    STATS_DIRNAME: null,
    API_URL: uiUrl(config),
    NODE_ENV: config.get('env'),
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
