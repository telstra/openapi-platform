require('babel-plugin-require-context-hook/register')();

module.exports = {
  testMatch: ['<rootDir>/test/**/*(*.)test.(t|j)sx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/config/', '/lib/'],
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  resetModules: true,
  resetMocks: true,
};
