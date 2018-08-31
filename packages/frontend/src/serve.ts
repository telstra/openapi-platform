import history from 'connect-history-api-fallback';
import express from 'express';

import { readConfig } from '@openapi-platform/config';

export async function serve(bundlePath: string) {
  const config = readConfig();
  /* 
    Note that if people want to customize this 
    they can just use build-openapi-platform-frontend
  */
  const app = express()
    .use(history())
    .use('/', express.static(bundlePath));

  const port = config.get('ui.port');
  return await new Promise((resolve, reject) => {
    try {
      // TODO: Consider resolving the app itself instead.
      app.listen(port, () => {
        resolve(port);
      });
    } catch (err) {
      reject(err);
    }
  });
}
