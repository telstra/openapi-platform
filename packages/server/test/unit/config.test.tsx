import { parse } from '../../src/config';
function validFullConfig(): any {
  return {
    env: 'development',
    server: {
      port: 8081,
      useCors: false,
      initDummydata: false,
    },
    database: {
      name: 'swagger_platform',
      host: '***REMOVED***',
      port: 5432,
      username: 'swagger_platform',
      password: '***REMOVED***',
    },
  };
}
describe('config validation', () => {
  describe('valid', () => {
    it('full config provided', () => {
      parse(validFullConfig());
    });
  });
  describe('invalid', () => {
    it('empty config', () => {
      expect(() => parse({})).toThrowError();
    });
    it('no database config', () => {
      const config = validFullConfig();
      config.database = undefined;
      expect(() => parse(config)).toThrowError();
    });
  });
});
