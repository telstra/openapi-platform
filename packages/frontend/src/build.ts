import webpack from 'webpack';

import createWebpackConfig from '../webpack.config';
import { config } from './config';
import { logger } from './logger';

export async function build({ ...webpackOptions } = {}) {
  logger.info('Bundling frontend app...');

  const webpackInputs = {
    output: {
      path: process.cwd(),
      statsDirName: null,
    },
    apiBaseUrl: config.get('ui.apiBaseUrl'),
    env: config.get('env'),
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
