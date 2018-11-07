const hooks = {
  before: {
    async create(c, context) {
      // Throws an error if it can't find the specification
      await c.app.service('specifications').get(context.data.specId, {});
      return context;
    },
  },
  after: {
    async remove(c, context) {
      // Remove any associated SDKs when a SDK configuration is removed
      if (Array.isArray(context.result)) {
        // For each SDK configuration, remove any associated SDKs
        context.result.forEach(async sdkConfig => {
          await c.app.service('sdks').remove(null, {
            query: { sdkConfigId: sdkConfig.id },
          });
        });
      } else {
        // Only a single SDK config was removed
        await c.app.service('sdks').remove(null, {
          query: { sdkConfigId: context.result.id },
        });
      }
      return context;
    },
  },
};
export default hooks;
