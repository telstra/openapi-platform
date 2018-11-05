import { store } from '@openapi-platform/server-addons';
import {
  withAddonHookOptionsDefaults,
  withStoreHookOptionsDefaults,
  Context,
  Addon,
  AddonHookOptions,
} from '../../src';
import { mockFunctions } from 'jest-mock-functions';
import createStore from 'fs-blob-store';
import { openapiLogger } from '@openapi-platform/logger';
jest.mock('@openapi-platform/logger');
jest.mock('fs-blob-store');

interface TestAddon extends Addon {
  hooks: AddonHookOptions;
}
function createTestAddon(overrides: any = {}): TestAddon {
  return {
    title: 'Test addon',
    hooks: mockFunctions(withAddonHookOptionsDefaults(), {
      recursive: true,
      onMockedFunction: fn => fn.mockImplementation(async () => {}),
    }),
    setup: jest.fn().mockImplementation(async () => {}),
  };
}

function createTestContext(): Context {
  return {
    blobStore: createStore(),
    logger: openapiLogger(),
  };
}

describe('store', () => {
  it('store(...) returns the same store', () => {
    expect(store()).toBe(store());
  });

  describe('hooks', () => {
    beforeEach(() => {
      const options = mockFunctions(withStoreHookOptionsDefaults(), {
        recursive: true,
      });
      store().hooks(options);
    });
    it('with no addons', async () => {
      await store().setup(createTestContext());
      expect(store().storeHooks.before.setup).toBeCalledTimes(1);
      expect(store().storeHooks.after.setup).toBeCalledTimes(1);
      expect(store().storeHooks.before.setupAddon).not.toBeCalled();
      expect(store().storeHooks.after.setupAddon).not.toBeCalled();
    });
    it('with addons', async () => {
      const addon1 = createTestAddon();
      const addon2 = createTestAddon();
      const context = createTestContext();
      await store()
        .register(addon1)
        .register(addon2)
        .setup(context);
      expect(store().storeHooks.before.setup).toBeCalledTimes(1);
      expect(store().storeHooks.after.setup).toBeCalledTimes(1);
      expect(store().storeHooks.before.setupAddon).toBeCalledTimes(2);
      expect(store().storeHooks.after.setupAddon).toBeCalledTimes(2);
      expect(addon1!.setup).toHaveBeenCalledTimes(1);
      expect(addon2!.setup).toHaveBeenCalledTimes(1);

      await store().addonHooks.before.sdks.generateSdk(context);
      expect(addon1.hooks!.before!.sdks!.generateSdk).toBeCalledTimes(1);
      expect(addon1.hooks!.after!.sdks!.generateSdk).toBeCalledTimes(0);

      await store().addonHooks.after.sdks.generateSdk(context);
      expect(addon1.hooks!.before!.sdks!.generateSdk).toBeCalledTimes(1);
      expect(addon1.hooks!.after!.sdks!.generateSdk).toBeCalledTimes(1);
    });
  });
});
