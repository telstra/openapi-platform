import 'source-map-support/register';

import { createServer } from 'backend/server';
import { logger, overrideConsoleLogger, overrideUtilInspectStyle } from 'backend/logger';
import { config } from 'config';
overrideConsoleLogger(logger);
overrideUtilInspectStyle();

import 'source-map-support/register';

async function run(port: number) {
  // Overriding logger used in non testing environments, logging in tests just go to stdout.
  overrideConsoleLogger(logger);
  overrideUtilInspectStyle();

  const app = await createServer();
  app.listen(port, (er, err) => {
    logger.info(`Swagger Platform Server now listening on port ${port}`);
  });
  return app;
}

const envPort: string | undefined = process.env.PORT;
const appPort: number = envPort ? Number.parseInt(envPort) : config.backend.port;
run(appPort);
