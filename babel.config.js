function createBabelPresets(options) {
  const presets = [];
  if (options.envSettings) {
    presets.push(['@babel/preset-env', options.envSettings]);
  }
  presets.push('@babel/preset-react', '@babel/preset-typescript');
  return presets;
}

function createBabelSettings(options) {
  return {
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
      browsers: ['last 2 versions'],
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

module.exports = api => {
  const env = api.env();
  const config = {
    ...defaultSettings,
    overrides: [
      {
        test: 'src/frontend',
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
      test: [
        './packages/frontend/.storybook',
        './packages/frontend/test/snapshots/storyshots.test.tsx',
      ],
      ...storyshotsSettings,
    });
  }

  return config;
};
