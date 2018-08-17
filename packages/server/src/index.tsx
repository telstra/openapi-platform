import 'source-map-support/register';

import { createServer } from './createServer';
import { logger, overrideConsoleLogger, overrideUtilInspectStyle } from '@openapi-platform/logger';
import { config } from '../config';

async function run(port: number) {
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

const envPort: string | undefined = process.env.PORT;
const appPort: number = envPort ? Number.parseInt(envPort, 10) : config.backend.port;
run(appPort);
