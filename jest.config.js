require('babel-plugin-require-context-hook/register')();
const buildUtils = require('@openapi-platform/build-util');
module.exports = Object.assign(buildUtils.jest.settings(), {
  projects: ['<rootDir>', '<rootDir>/packages/*', '<rootDir>/build-packages/*'],
});
