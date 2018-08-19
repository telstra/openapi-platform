import { Config } from 'convict';
import { pathExistsSync } from 'fs-extra';
import { join } from 'path';
import { schema } from './schema';

export function parse<T>(): Config<T> {
  const cwd = process.cwd();
  let parsedConfig: Config<T> | undefined;
  const extensions = ['json', 'yaml', 'yml', 'json5'];
  for (const ext of extensions) {
    try {
      const path = join(cwd, `openapi-platform.config.${ext}`);
      if (pathExistsSync(path)) {
        parsedConfig = schema.loadFile(path);
        break;
      }
    } catch (err) {
      parsedConfig = undefined;
    }
  }
  if (!parsedConfig) {
    throw new Error(
      `Failed to find an openapi-platform.config.${extensions.join('/')} file`,
    );
  }
  schema.validate({ allowed: 'strict' });
  return parsedConfig;
}
// TODO: We can provide more ways to specify configs in the future
export const config = parse();
