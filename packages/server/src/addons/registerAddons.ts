import { Context } from '@openapi-platform/server-addons';
import { exists } from 'mz/fs';
import { addonsPath, addonsBasePath } from './addon-paths';
export async function registerAddons(c: Context) {
  if (await exists(addonsPath())) {
    require(addonsBasePath());
  } else {
    /* 
      Note that we can use the logger at this point
      since there's no addons. No addons = nothing that can replace the context's 
      logger
    */
    c.logger.info(
      `Could not find ${addonsPath()}, if you have addons they should be registered here`,
    );
  }
}
