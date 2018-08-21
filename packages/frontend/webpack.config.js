const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
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

module.exports = env => {
  const isProduction = env.NODE_ENV === 'production';
  return {
    name: 'Frontend',
    target: 'web',
    entry: join(__dirname, 'src', 'index.tsx'),
    output: {
      filename: 'index.js',
      publicPath: '/',
    },
    mode: isProduction ? 'production' : 'development',
    module: {
      rules: [
        {
          test: /\.tsx$/,
          loader: 'babel-loader',
        },
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
    devtool: 'cheap-module-source-map',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: `OpenAPI Platform${isProduction ? '' : ' (Developer mode)'}`,
        template: join(__dirname, 'public', 'index.html'),
      }),
      new HotModuleReplacementPlugin(),
    ],
    stats,
  };
};
