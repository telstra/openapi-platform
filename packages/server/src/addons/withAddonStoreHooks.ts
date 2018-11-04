import { store } from '@openapi-platform/server-addons';
import { logger } from '../logger';
export function withAddonStoreHooks() {
  store().hooks({
    before: {
      async setupAddon(context) {
        logger.info(`Registering ${context.installingAddon.title}`);
      },
    },
  });
}
