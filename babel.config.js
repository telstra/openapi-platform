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
          polyfill: false,
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
    config.overrides.push({
      test: ['.storybook', 'test/snapshots/storyshots.test.tsx'],
      ...storyshotsSettings,
    });
  }

  return config;
};
