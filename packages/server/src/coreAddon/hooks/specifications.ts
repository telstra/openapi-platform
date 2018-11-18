const hooks = {
  after: {
    async remove(c, context) {
      // Remove any associated SDK configurations when a specification is removed
      if (Array.isArray(context.result)) {
        // For each specification, remove any associated SDK configurations
        context.result.forEach(async specification => {
          await c.app.service('sdkConfigs').remove(null, {
            query: { specId: specification.id },
          });
        });
      } else {
        // Only a single specification was removed
        await c.app.service('sdkConfigs').remove(null, {
          query: { specId: context.result.id },
        });
      }
    },
  },
};

export default hooks;
