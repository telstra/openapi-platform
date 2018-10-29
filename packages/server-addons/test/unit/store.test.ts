import { store } from '@openapi-platform/server-addons';
import { withDefaultHooksOptions, CompleteHooksOptions } from '@openapi-platform/hooks';
import { GitHookKeys } from '@openapi-platform/git-util';
import {
  AppAddonHookKeys,
  StoreHookKeys,
  AddonHookOptions,
  Context,
  Addon,
} from '../../src';
import { mockFunctions } from 'jest-mock-functions';
import createStore from 'fs-blob-store';
jest.mock('fs-blob-store');

interface TestAddon extends Addon {
  hooks: AddonHookOptions;
}

function createTestAddon(overrides = {}): TestAddon {
  return {
    title: 'Test addon',
    hooks: mockFunctions(
      {
        app: withDefaultHooksOptions(undefined, AppAddonHookKeys),
        git: withDefaultHooksOptions(undefined, GitHookKeys),
      },
      { recursive: true, onMockedFunction: fn => fn.mockReturnValue(Promise.resolve()) },
    ),
    setup: jest.fn().mockReturnValue(Promise.resolve()),
    ...overrides,
  };
}

function createTestContext(): Context {
  return {
    blobStore: createStore(),
  };
}

describe('store', () => {
  it('store(...) returns the same store', () => {
    expect(store()).toBe(store());
  });

  describe('hooks', () => {
    beforeEach(() => {
      const options = mockFunctions(withDefaultHooksOptions(undefined, StoreHookKeys), {
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
      expect(addon1.setup).toHaveBeenCalledTimes(1);
      expect(addon2.setup).toHaveBeenCalledTimes(1);

      await store().addonHooks.app.before.generateSdk(context);
      expect(addon1.hooks.app.before!.generateSdk).toBeCalledTimes(1);
      expect(addon1.hooks.app.after!.generateSdk).toBeCalledTimes(0);

      await store().addonHooks.app.after.generateSdk(context);
      expect(addon1.hooks.app.before!.generateSdk).toBeCalledTimes(1);
      expect(addon1.hooks.app.after!.generateSdk).toBeCalledTimes(1);
    });
  });
});
