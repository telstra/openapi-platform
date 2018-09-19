// TODO: Bit of a weird hack to go out and back into another package
const createWebpackConfig = require('../packages/frontend/webpack.config');
const { DefinePlugin } = require('webpack');
module.exports = (storybookConfig, configType) => {
  const frontendConfig = createWebpackConfig();
  storybookConfig.module = frontendConfig.module;
  storybookConfig.module.rules.push({
    loader: 'babel-loader',
    test: /\.tsx?$/,
  });
  storybookConfig.resolve.extensions.push('.tsx');
  storybookConfig.plugins.push(
    ...frontendConfig.plugins.filter(plugin => plugin instanceof DefinePlugin),
  );
  storybookConfig.plugins.forEach(console.log);
  return storybookConfig;
};
