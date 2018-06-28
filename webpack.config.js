module.exports = (env, argv) => {
  const paths = require('./paths');
  const { join } = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const WebpackShellPlugin = require('webpack-shell-plugin');
  const { HotModuleReplacementPlugin } = require('webpack');
  const nodeExternals = require('webpack-node-externals');
  const createBabelPresets = envSettings => [
    ['@babel/preset-env', envSettings],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ];
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
  const createWebpackSettings = envSettings => ({
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.tsx$/,
          loader: 'babel-loader',
          options: {
            presets: createBabelPresets(envSettings),
            plugins: [
              [
                'module-resolver',
                {
                  root: ['.'],
                  alias: {
                    src: paths.src,
                    test: paths.test,
                    config: paths.config,
                    view: paths.view,
                    model: paths.model,
                    basic: paths.basic,
                    state: paths.state,
                    client: paths.client,
                    backend: paths.backend,
                    frontend: paths.frontend,
                  },
                },
              ],
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              [
                '@babel/plugin-transform-runtime',
                {
                  polyfill: false,
                  regenerator: true,
                },
              ],
            ],
          },
        },
      ],
    },
    devtool: 'cheap-module-source-map',
    resolve: {
      extensions: ['.tsx', '.js', '.jsx', '.ts', '.tsx'],
    },
    stats,
  });
  const backendPlugins = [];
  if (argv.mode === 'development') {
    const backendIndex = join(paths.buildBackend, 'main.js');
    backendPlugins.push(
      new WebpackShellPlugin({
        onBuildEnd: [
          'echo "Rebuilding backend...\n',
          `nodemon ${backendIndex} --quiet --watch ./build/backend`,
        ],
      }),
    );
  }
  const backend = {
    name: 'Backend',
    target: 'node',
    entry: join(paths.src, 'backend', 'index.tsx'),
    output: {
      path: join(__dirname, 'build', 'backend'),
      filename: '[name].js',
    },
    plugins: backendPlugins,
    externals: [nodeExternals()],
    ...createWebpackSettings({
      targets: {
        node: 'current',
      },
    }),
  };
  let frontend = createWebpackSettings({
    targets: {
      browsers: ['last 2 versions'],
    },
  });
  frontend.module.rules.push(
    {
      test: /\.css$/,
      use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
    },
    {
      test: /\.(svg|tff|woff2?)$/,
      loader: 'file-loader',
    },
  );
  frontend = {
    name: 'Frontend',
    target: 'web',
    entry: join(paths.src, 'frontend', 'index.tsx'),
    output: {
      path: join(__dirname, 'build', 'frontend'),
      filename: '[name].js',
      publicPath: '/',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Swagger Platform',
        template: join(paths.public, 'index.html'),
      }),
      new HotModuleReplacementPlugin(),
    ],
    devServer: {
      hot: true,
      https: false,
      open: true,
      overlay: true,
      port: 3000,
      progress: true,
      historyApiFallback: true,
      stats,
    },
    ...frontend,
  };
  return [backend, frontend];
};
