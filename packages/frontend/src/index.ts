import { readConfig } from '@openapi-platform/config';
import { openapiLogger } from '@openapi-platform/logger';
import webpack from 'webpack';
import createWebpackConfig from '../webpack.config';

export function build({ ...webpackOptions }) {
  const logger = openapiLogger();
  logger.info('Bundling frontend app...');

  const openapiConfig = readConfig();
  const webpackConfig = createWebpackConfig({
    API_PORT: openapiConfig.get('server.port'),
    NODE_ENV: openapiConfig.get('env'),
    ...webpackOptions,
  });

  webpack(webpackConfig, error => {
    if (error) {
      logger.error('An error occurred when configuring webpack compiler...');
      logger.error(error);
      return;
    } else {
      logger.info('Webpack configuration complete');
    }
  });
}
