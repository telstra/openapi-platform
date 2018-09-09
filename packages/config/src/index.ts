import { pathExistsSync } from 'fs-extra';
import { join } from 'path';
import { schema } from './schema';
export { schema };

/**
 * Gets the url of a particular section of the config based off the protocol, host and port fields.
 * @param config The configuration (usually the return value from readConfig)
 * @param prefix The sub config that you want the url fields to be taken from E.g. 'server' or 'ui'
 */
function urlFromConfig(config, prefix: string): string {
  return `${config.get(`${prefix}.protocol`)}://${config.get(`${prefix}.host`)}:${config.get(`${prefix}.port`)}`;
}

export function serverUrl(config): string {
  return urlFromConfig(config, 'server');
}

export function uiUrl(config): string {
  return urlFromConfig(config, 'ui');
}

export function readConfig() {
  const cwd = process.cwd();
  let parsedConfig;
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
