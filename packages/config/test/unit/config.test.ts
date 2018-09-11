import { schema } from '../../src/schema';
function validFullConfig(): any {
  return {
    env: 'development',
    server: {
      port: 8081,
      useCors: false,
    },
    database: {
      name: 'swagger_platform',
      host: 'localhost',
      port: 5432,
      username: 'swagger_platform',
      password: 'test_password',
    },
  };
}
describe('config validation', () => {
  describe('valid', () => {
    it('full config provided', () => {
      schema.load(validFullConfig());
      schema.validate({ allowed: 'strict' });
    });
  });
  describe('invalid', () => {
    function testThrows(testCaseName, alterConfig) {
      it(testCaseName, () => {
        const config = validFullConfig();
        alterConfig(config);
        expect(() => {
          schema.load(config);
          schema.validate({ allowed: 'strict' });
        }).toThrowError();
      });
    }
    testThrows(
      'database port is not a number',
      config => (config.database.port = 'not a port'),
    );
    testThrows('password is not a string', config => (config.database.password = 100));
  });
});
