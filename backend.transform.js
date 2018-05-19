const createWebpackConfig = require('./webpack.config');
const webpackConfig = createWebpackConfig(process.env, process.argv);
const backendConfig = webpackConfig.filter(({ name }) => name === 'Backend')[0];
const babelConfig = backendConfig.module.rules.filter(
  ({ loader }) => loader === 'babel-loader',
)[0];
const babelOptions = babelConfig.options;

const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer(babelOptions);
