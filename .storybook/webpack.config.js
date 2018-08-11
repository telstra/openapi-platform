const createOurConfigs = require('../webpack.config');
module.exports = (storybookConfig, configType) => {
  const frontendConfig = createOurConfigs([], 'development').filter(
    config => config.name === 'Frontend',
  )[0];
  storybookConfig.module = frontendConfig.module;
  storybookConfig.resolve = frontendConfig.resolve;
  return storybookConfig;
};
