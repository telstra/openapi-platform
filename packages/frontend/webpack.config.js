const { join } = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { config } = require('./lib/config');
const { apiBaseUrl } = require('@openapi-platform/config');

const stats = {
  colors: true,
  reasons: true,
  errorDetails: true,
  env: false,
  builtAt: true,
  assets: true,
  source: false,
  modules: false,
  hash: false,
  publicPath: false,
  version: false,
  entrypoints: false,
  cached: false,
  chunks: false,
  cachedAssets: false,
  chunkModules: false,
  chunkOrigins: false,
  moduleTrace: false,
  children: false,
};

module.exports = (options = {}) => {
  const { output = {} } = options;
  const env = config.get('env');
  const { path = __dirname, distDirName = 'dist', statsDirName = 'stats' } = output;
  const isProduction = env === 'production';
  const plugins = [
    new HtmlWebpackPlugin({
      title: `OpenAPI Platform${isProduction ? '' : ' (Developer mode)'}`,
      template: join(__dirname, 'public', 'index.html'),
    }),
    new HotModuleReplacementPlugin(),
    new DefinePlugin({
      API_BASE_URL: JSON.stringify(apiBaseUrl(config)),
    }),
  ];
  if (statsDirName) {
    plugins.push(
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        reportFilename: join(path, statsDirName, 'bundle.html'),
      }),
    );
  }
  return {
    name: 'Frontend',
    target: 'web',
    entry: '@openapi-platform/frontend-dist',
    output: {
      filename: 'index.js',
      path: join(path, distDirName),
      publicPath: '/',
    },
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
        },
        {
          test: /\.(svg|tff|woff2?)$/,
          loader: 'file-loader',
        },
      ],
    },
    plugins,
    stats,
  };
};
