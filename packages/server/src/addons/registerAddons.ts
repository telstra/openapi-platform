import { exists } from 'mz/fs';
import { logger } from '../logger';
import { addonsPath, addonsBasePath } from './addon-paths';
export async function registerAddons() {
  if (await exists(addonsPath())) {
    logger.info(`Detected ${addonsPath()}, registering addons`);
    require(addonsBasePath());
  } else {
    logger.info(
      `Could not find ${addonsPath()}, if you have addons they should be registered here`,
    );
  }
}
