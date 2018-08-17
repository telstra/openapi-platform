require('babel-plugin-require-context-hook/register')();
const buildUtils = require('./build-packages/build-utils/src');
module.exports = Object.assign(buildUtils.jest.settings(), {
  projects: ['<rootDir>', '<rootDir>/packages/*', '<rootDir>/build-packages/*'],
});
