const config = require('@openapi-platform/build-util').jest.settings();
config.globals = {
  // TODO: Shouldn't have to specify this - Client needs to be mocked
  API_URL: 'http://localhost:8080',
};
module.exports = config;
