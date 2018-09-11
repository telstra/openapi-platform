import { join } from 'path';
import { schema } from '../../src/schema';
describe('config parsing compatible file formats', () => {
  const extensions = ['json', 'json5', 'yml', 'yaml'];
  for (const ext of extensions) {
    it('ext', () => {
      const config = schema.loadFile(join(__dirname, `config/config.${ext}`));
      schema.validate({ allowed: 'strict' });
      expect(config.get('database')).toEqual({
        name: 'test_name',
        host: 'test_host',
        port: 1337,
        username: 'test_username',
        password: 'test_password',
      });
    });
  }
});
