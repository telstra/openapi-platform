import { Context } from '@openapi-platform/server-addons';
import { exists } from 'mz/fs';
import { addonsPath, addonsBasePath } from './addon-paths';
export async function registerAddons(c: Context) {
  if (await exists(addonsPath())) {
    c.logger.info(`Detected ${addonsPath()}, registering addons`);
    require(addonsBasePath());
  } else {
    c.logger.info(
      `Could not find ${addonsPath()}, if you have addons they should be registered here`,
    );
  }
}
