import 'source-map-support/register';

import {
  logger,
  overrideConsoleLogger,
  overrideUtilInspectStyle,
} from '@openapi-platform/logger';
import { config } from './config';
import { createServer } from './createServer';
export async function run() {
  const port = config.get('server.port');
  // Overriding logger used in non testing environments, logging in tests just go to stdout.
  overrideConsoleLogger(logger);
  overrideUtilInspectStyle();
  logger.info('Creating OpenAPI Platform server...');

  const app = await createServer();

  app.listen(port, (er, err) => {
    logger.info(`OpenAPI Platform Server now listening on port ${port}`);
  });

  return app;
}
