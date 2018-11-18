export const storeHooks = {
  after: {
    async setupAddon(c, addon) {
      c.logger.info(`Installed ${addon.title} addon`);
    },
  },
};
