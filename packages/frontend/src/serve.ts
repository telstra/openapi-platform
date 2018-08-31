import { join } from 'path';

import express from 'express';
import { readConfig } from '@openapi-platform/config';

export async function serve({ bundleDir = join(__dirname, 'dist')}) {
  const config = readConfig();
  /* 
    Note that if people want to customize this 
    they can just use build-openapi-platform-frontend
  */
  const app = express();
  
  // TODO: If the bundle output changes, this will break. Needs to be refactored.
  app.use('/', express.static(bundleDir));
  
  const port = config.get('ui.port');
  return await new Promise((resolve, reject) => {
    try {
      // TODO: Consider resolving the app itself instead.
      app.listen(port, () => {
        resolve(port);
      });
    } catch(err) {
      reject(err);
    }
  });
}
