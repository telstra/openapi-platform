const { join } = require('path');
function settings() {
  return {
    roots: [join(__dirname, '../../..')],
    testMatch: ['<rootDir>/test/?(**/)?(*.)test.(t|j)s?(x)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/lib/', '/build/'],
    collectCoverage: true,
    resetMocks: true,
    resetModules: true,
    testURL: 'http://localhost/',
    transform: {
      '^.+\\.[jt]sx?$': 'babel-jest',
    },
  };
}
module.exports = { settings };
