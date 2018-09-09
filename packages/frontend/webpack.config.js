const { join } = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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

module.exports = ({
  API_URL,
  NODE_ENV = 'development',
  OUTPUT_PATH = __dirname,
  DIST_DIRNAME = 'dist',
  STATS_DIRNAME = 'stats',
}) => {
  const isProduction = NODE_ENV === 'production';
  const plugins = [
    new HtmlWebpackPlugin({
      title: `OpenAPI Platform${isProduction ? '' : ' (Developer mode)'}`,
      template: join(__dirname, 'public', 'index.html'),
    }),
    new HotModuleReplacementPlugin(),
    new DefinePlugin({
      API_URL,
    }),
  ];
  if (STATS_DIRNAME) {
    plugins.push(
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        reportFilename: join(OUTPUT_PATH, STATS_DIRNAME, 'bundle.html'),
      }),
    );
  }
  return {
    name: 'Frontend',
    target: 'web',
    entry: '@openapi-platform/frontend-dist',
    output: {
      filename: 'index.js',
      path: join(OUTPUT_PATH, DIST_DIRNAME),
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
