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
  const defaultSettings = createBabelSettings({
    envSettings: {
      targets: {
        node: 'current',
      },
    },
  });

  const config = {
    ...defaultSettings,
    overrides: [],
  };
  if (env === 'test') {
    /*
      This only exists because stories are found via require.context(...)
      which is only available when code run through webpack. Snapshot tests
      aren't run through Webpack.
    */
    const storyshotsSettings = createBabelSettings({
      envSettings: {
        targets: {
          node: 'current',
        },
      },
    });
    storyshotsSettings.plugins.push('require-context-hook');
    config.overrides.push({
      test: [
        join(__dirname, 'packages/frontend/.storybook'),
        join(__dirname, 'packages/frontend/test/snapshots/storyshots.test.tsx'),
      ],
      ...storyshotsSettings,
    });
  } else {
    // Outside of the test env, we to make the bundle compatible with browsers instead of node
    const frontendSettings = createBabelSettings({
      envSettings: {
        modules: false,
        targets: {
          browsers: [
            'last 2 Chrome versions',
            'last 2 ChromeAndroid versions',
            'last 2 Firefox versions',
            'Firefox ESR',
            'last 2 Edge versions',
            'last 2 Safari version',
            'last 2 iOS version',
          ],
        },
      },
    });
    config.overrides.push({
      test: join(__dirname, 'packages/frontend/src'),
      ...frontendSettings,
    });
  }

  return config;
};
