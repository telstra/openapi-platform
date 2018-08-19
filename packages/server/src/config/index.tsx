import { logger } from '@openapi-platform/logger';
import { join } from 'path';
import { schema } from './schema';

export function parse(rawConfig) {
  const config = schema.load(rawConfig);
  schema.validate({ allowed: 'strict' });
  return config;
}
const cwd = process.cwd();
// TODO: We can provide more ways to specify configs in the future
// tslint:disable:no-var-requires
const rawConfig = require(join(cwd, 'openapi-platform.config'));
if (!rawConfig) {
  logger.error(
    'You need to provide an openapi-platform.config.js configuration file in your current working directory',
  );
  process.exit(1);
}
export const config = parse(rawConfig);
