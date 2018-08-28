const { join } = require('path');
module.exports = api => {
  const env = api.env();

  function createBabelPresets(options) {
    const presets = [];
    if (options.envSettings) {
      presets.push(['@babel/preset-env', options.envSettings]);
    }
    presets.push('@babel/preset-react', '@babel/preset-typescript');
    return presets;
  }

  function createBabelSettings(options) {
    const settings = {
      presets: createBabelPresets(options),
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        [
          '@babel/plugin-transform-runtime',
          {
            regenerator: true,
          },
        ],
      ],
    };
    if (env === 'test') {
      settings.plugins.push('babel-plugin-istanbul');
    }
    return settings;
  }

  const nodeTargets = {
    node: '6',
  };

  const browserTargets = {
    browsers: [
      'last 2 Chrome versions',
      'last 2 ChromeAndroid versions',
      'last 2 Firefox versions',
      'Firefox ESR',
      'last 2 Edge versions',
      'last 2 Safari version',
      'last 2 iOS version',
    ],
  };

  /**
   * By default, packages need to support both node and browsers
   */
  const defaultSettings = createBabelSettings({
    envSettings: {
      modules: env === 'es6-modules' ? false : undefined,
      targets: {
        ...nodeTargets,
        ...browserTargets,
      },
    },
  });

  /**
   * Note that tests run in node so the target needs be noed for test envs
   */
  const frontendTargets = env === 'test' ? nodeTargets : browserTargets;

  const storyshotsSettings = createBabelSettings({
    envSettings: {
      targets: {
        ...frontendTargets,
      },
    },
  });

  const frontendSettings = createBabelSettings({
    envSettings: {
      // Webpack handles modules for us (but not in test envs!)
      modules: env !== 'test' ? false : undefined,
      targets: {
        ...frontendTargets,
      },
    },
  });

  const overrides = [
    {
      test: [
        join(__dirname, 'packages/frontend/.storybook'),
        join(__dirname, 'packages/frontend/test/snapshots/storyshots.test.tsx'),
      ],
      ...storyshotsSettings,
    },
    {
      test: join(__dirname, 'packages/frontend/src'),
      ...frontendSettings,
    },
  ];

  if (env === 'test') {
    /*
      This only exists because stories are found via require.context(...)
      which is only available when code run through webpack. Snapshot tests
      aren't run through Webpack.
    */
    storyshotsSettings.plugins.push('require-context-hook');
  }
  const config = {
    ...defaultSettings,
    overrides,
  };
  return config;
};
