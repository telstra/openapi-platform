import 'source-map-support/register';

import {
  overrideConsoleLogger,
  overrideUtilInspectStyle,
} from '@openapi-platform/logger';

import { config } from './config';
import { createServer } from './createServer';
import { logger } from './logger';
export async function run() {
  const port = config.get('server.port');
  const host = config.get('server.host');
  // Overriding logger used in non testing environments, logging in tests just go to stdout.
  overrideConsoleLogger(logger);
  overrideUtilInspectStyle();
  logger.info('Creating OpenAPI Platform server...');

  const app = await createServer();

  await app.listen(port, host);
  logger.info(`OpenAPI Platform Server now listening on port ${port}`);

  return app;
}
