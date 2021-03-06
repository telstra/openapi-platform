import history from 'connect-history-api-fallback';
import express from 'express';

import { config } from './config';

export async function serve(bundlePath: string) {
  /* 
    Note that if people want to customize this 
    they can just use build-openapi-platform-frontend
  */
  const app = express()
    .use(history())
    .use('/', express.static(bundlePath));

  const port = config.get('ui.port');
  const host = config.get('ui.host');
  return await new Promise((resolve, reject) => {
    try {
      // TODO: Consider resolving the app itself instead.
      app.listen(port, host, () => {
        resolve(port);
      });
    } catch (err) {
      reject(err);
    }
  });
}
