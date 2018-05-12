const createOurConfigs = require('../webpack.config');
const { join } = require('path');
module.exports = (storybookConfig, configType) => {
  const frontendConfig = createOurConfigs([], 'development').filter(
    config => config.name === 'Frontend',
  )[0];
  storybookConfig.module = frontendConfig.module;
  storybookConfig.resolve = frontendConfig.resolve;
  console.log(JSON.stringify(storybookConfig, undefined, 2));
  console.log(storybookConfig.entry);
  return storybookConfig;
};
