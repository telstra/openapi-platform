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
  API_PROTOCOL = 'http',
  API_HOST = 'localhost',
  API_PORT = 8080,
  NODE_ENV = 'development',
  OUTPUT_PATH = join(__dirname, 'dist'),
}) => {
  const isProduction = NODE_ENV === 'production';
  return {
    name: 'Frontend',
    target: 'web',
    entry: join(__dirname, 'lib', 'webapp.js'),
    output: {
      filename: 'index.js',
      path: OUTPUT_PATH,
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
    plugins: [
      new HtmlWebpackPlugin({
        title: `OpenAPI Platform${isProduction ? '' : ' (Developer mode)'}`,
        template: join(__dirname, 'public', 'index.html'),
      }),
      new HotModuleReplacementPlugin(),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        reportFilename: join(__dirname, 'stats/bundle.html'),
      }),
      new DefinePlugin({
        API_URL: `"${API_PROTOCOL}://${API_HOST}:${API_PORT}"`,
      }),
    ],
    stats,
  };
};
