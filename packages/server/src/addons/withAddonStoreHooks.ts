import { store } from '@openapi-platform/server-addons';
import { Context } from '@openapi-platform/server-addons';
export function withAddonStoreHooks(c: Context) {
  store().hooks({
    after: {
      async setupAddon(context) {
        c.logger.info(`Registered ${context.installingAddon.title} addon`);
      },
    },
  });
}
