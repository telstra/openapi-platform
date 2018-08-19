import { Config } from 'convict';
import { pathExistsSync } from 'fs-extra';
import { join } from 'path';
import { schema } from './schema';

export function readConfig<T>(): Config<T> {
  const cwd = process.cwd();
  let parsedConfig: Config<T> | undefined;
  const extensions = ['json', 'yaml', 'yml', 'json5'];
  for (const ext of extensions) {
    const path = join(cwd, `openapi-platform.config.${ext}`);
    if (pathExistsSync(path)) {
      parsedConfig = schema.loadFile(path);
      break;
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
