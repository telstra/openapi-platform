import 'source-map-support/register';

import { config } from './config';
import { createServer } from './createServer';
import { C } from './symbols';

export async function run() {
  const port = config.get('server.port');
  const host = config.get('server.host');
  const app = await createServer();

  await app.listen(port, host);
  const c = app[C];

  c.logger.info(`OpenAPI Platform Server now listening on port ${port}`);

  return app;
}
