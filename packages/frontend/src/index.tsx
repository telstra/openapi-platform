import { readConfig } from '@openapi-platform/config';
import webpack from 'webpack';
import createWebpackConfig from '../webpack.config';

export function build() {
  const openapiConfig = readConfig();
  const webpackConfig = createWebpackConfig({
    API_PORT: openapiConfig.get('server.port'),
    NODE_ENV: openapiConfig.get('env'),
  });
  webpack(webpackConfig);
}
