const paths = require('./paths');
const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const common = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx$/,
        loader: 'babel-loader'
      }
    ]
  },
  devtool: 'cheap-module-source-map',
  resolve: {
    extensions: ['.tsx', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      src: paths.src,
      test: paths.test,
      config: paths.config
    }
  },
  stats: {
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
    children: false
  }
};
const backend = {
  name: 'Backend',
  target: 'node',
  entry: join(paths.src, 'backend', 'index.tsx'),
  output: {
    path: join(__dirname, 'build', 'backend'),
    filename: '[name].js'
  },
  externals: [nodeExternals()],
  ...common
};
const frontend = {
  name: 'Frontend',
  target: 'web',
  entry: ['@babel/polyfill', join(paths.src, 'frontend', 'index.tsx')],
  output: {
    path: join(__dirname, 'build', 'frontend'),
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Swagger Platform',
      template: join(paths.public, 'index.html')
    })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  ...common
};
module.exports = [backend, frontend];
