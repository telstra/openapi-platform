import 'source-map-support/register';

import { logger, overrideConsoleLogger, overrideUtilInspectStyle } from 'backend/logger';
import { createServer } from 'backend/server';

import { config } from 'config';
overrideConsoleLogger(logger);
overrideUtilInspectStyle();

import 'source-map-support/register';

async function run(port: number) {
  const app = await createServer();
  app.listen(port, (er, err) => {
    logger.info(`Swagger Platform Server now listening on port ${port}`);
  });
  return app;
}

const envPort: string | undefined = process.env.PORT;
const appPort: number = envPort ? Number.parseInt(envPort) : config.backend.port;
run(appPort);
