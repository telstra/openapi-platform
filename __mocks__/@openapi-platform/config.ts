const { schema, apiBaseUrl, uiUrl, serverUrl } = require.requireActual(
  '@openapi-platform/config',
);
export { schema, apiBaseUrl, uiUrl, serverUrl };
/**
 * Just provides a consistent config for tests to use
 */
export function readConfig() {
  const config = schema.load({
    env: 'test',
    server: {
      port: 8080,
      useCors: false,
    },
    database: {
      name: 'test_name',
      host: 'test_host',
      port: 1337,
      username: 'test_username',
      password: 'test_password',
    },
  });
  return config;
}
