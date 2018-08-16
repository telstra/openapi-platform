require('babel-plugin-require-context-hook/register')();

module.exports = {
  testMatch: ['<rootDir>/test/**/?(*.)test.(t|j)s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/config/', '/lib/'],
  transform: {
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  testURL: 'http://localhost',
  resetModules: true,
  resetMocks: true,
};
