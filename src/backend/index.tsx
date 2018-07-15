import 'source-map-support/register';

import { createServer } from 'backend/server';
import { logger, overrideConsoleLogger, overrideUtilInspectStyle } from 'backend/logger';
import { initDummyData } from 'backend/initDummyData';
import { config } from 'config';

import 'source-map-support/register';

async function run(port: number) {
  // Overriding logger used in non testing environments, logging in tests just go to stdout.
  overrideConsoleLogger(logger);
  overrideUtilInspectStyle();
  logger.info('Creating Swagger Platform server...');
  const app = await createServer();
  await initDummyData(app.service('specifications'), app.service('plans'));
  app.listen(port, (er, err) => {
    logger.info(`Swagger Platform Server now listening on port ${port}`);
  });
  return app;
}

const envPort: string | undefined = process.env.PORT;
const appPort: number = envPort ? Number.parseInt(envPort) : config.backend.port;
run(appPort);
