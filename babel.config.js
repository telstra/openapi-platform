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

  const frontendSettings = createBabelSettings({
    envSettings: {
      targets: {
        browsers: ['edge >= 12'],
      },
    },
  });

  const storyshotsSettings = createBabelSettings({
    envSettings: {
      targets: {
        node: 'current',
      },
    },
  });
  storyshotsSettings.plugins.push('require-context-hook');

  const config = {
    ...defaultSettings,
    overrides: [
      {
        test: './packages/frontend/src',
        ...frontendSettings,
      },
    ],
  };

  if (env === 'test') {
    /* 
      This only exists because stories are found via require.context(...) 
      which is only available when code run through webpack. Snapshot tests 
      aren't run through Webpack.
    */
    config.overrides.push({
      test: [],
      ...storyshotsSettings,
    });
  }

  return config;
};
