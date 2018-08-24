
const webpack = require('webpack');
const createWebpackConfig = require('../webpack.config');
const { readConfig } = require('@openapi-platform/config')
function run() {
  const openapiConfig = readConfig();
  const webpackConfig = createWebpackConfig({
    API_PORT: openapiConfig.get('server.port'),
    NODE_ENV: openapiConfig.get('env'),
  });
  webpack(webpackConfig);
}

run();