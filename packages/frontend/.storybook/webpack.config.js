const createWebpackConfig = require('../webpack.config');
module.exports = (storybookConfig, configType) => {
  const frontendConfig = createWebpackConfig([], 'development');
  storybookConfig.module = frontendConfig.module;
  storybookConfig.resolve = frontendConfig.resolve;
  return storybookConfig;
};
