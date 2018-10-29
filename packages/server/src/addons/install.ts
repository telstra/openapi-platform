import { join } from 'path';
import { readdir } from 'mz/fs';
import { store } from '@openapi-platform/server-addons';
import { addonDir } from './addonDir';
import { logger } from '../logger';
export async function installAddons(context) {
  const dir = addonDir();
  const filePaths = await readdir(dir);
  filePaths
    .filter(filePath => filePath.match(/\.js$/))
    .forEach(jsFilePath => require(join(dir, jsFilePath)));
  store().hooks({
    before: {
      async setupAddon(context) {
        logger.info(`Registering ${context.installingAddon.title}`);
      },
    },
  });
  await store().setup(context);
}
