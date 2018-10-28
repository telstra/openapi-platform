const buildUtils = require('@openapi-platform/build-util');
module.exports = {
  ...buildUtils.jest.settings(),
  projects: ['<rootDir>', '<rootDir>/packages/*', '<rootDir>/build-packages/*'],
};
