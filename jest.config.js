const buildUtils = require('@openapi-platform/build-util');
const config = buildUtils.jest.settings();
// TODO: Shouldn't have to specify this - Client needs to be mocked
const { readConfig, apiBaseUrl } = require('@openapi-platform/config');
const openapiConfig = readConfig();
module.exports = Object.assign(config, {
  globals: {
    API_BASE_URL: apiBaseUrl(openapiConfig),
  },
  projects: ['<rootDir>', '<rootDir>/packages/*', '<rootDir>/build-packages/*'],
});
