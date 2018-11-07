import { Addon } from '@openapi-platform/server-addons';
import sdkConfigs from './hooks/sdkConfigs';
import sdks from './hooks/sdks';
import specifications from './hooks/specifications';
export const coreAddon: Addon = {
  title: 'OpenAPI Platform',
  hooks: {
    before: {
      sdks: sdks.before,
    },
    after: {
      sdkConfigs: sdkConfigs.after,
      sdks: sdks.after,
      specifications: specifications.after,
    },
  },
};
