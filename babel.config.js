const paths = require('./paths');
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
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
      browsers: [
        'last 2 Chrome versions',
        'last 2 ChromeAndroid versions',
        'last 2 Firefox versions',
        'Firefox ESR',
        'last 1 Edge version',
        'IE 11',
        'last 1 Safari version',
      ],
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
        test: ['src/frontend', 'src/view'],
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
      test: ['.storybook', 'test/snapshots/storyshots.test.tsx'],
      ...storyshotsSettings,
    });
  }

  return config;
};
