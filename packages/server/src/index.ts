import 'source-map-support/register';

import { config } from './config';
import { createServer } from './createServer';

export async function run() {
  const port = config.get('server.port');
  const host = config.get('server.host');
  const c = await createServer();
  c.port = port;
  c.host = host;
  try {
    await c.app.listen(c.port, c.host);
  } catch (err) {
    c.logger.error(err);
  }

  c.logger.info(`OpenAPI Platform Server now listening on port ${c.port}`);

  return c;
}
