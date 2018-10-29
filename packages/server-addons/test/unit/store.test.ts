import { store } from '@openapi-platform/server-addons';
import { withDefaultHooksOptions, CompleteHooksOptions } from '@openapi-platform/hooks';
import { AppAddonHookKeys, StoreHookKeys, AppAddonHookOptions, Context } from '../../src';
import { mockFunctions, MockedFunctions } from 'jest-mock-functions';
import createStore from 'fs-blob-store';
jest.mock('fs-blob-store');

function createTestAddon() {
  return {
    title: 'Test addon',
    setup: jest.fn().mockReturnValue(Promise.resolve())
  }
}

function createTestContext(): Context {
  return {
    blobStore: createStore()
  }
}

describe('store', () => {
  it('store(...) returns the same store', () => {
    expect(store()).toBe(store());
  });
  
  describe('hooks', () => {
    beforeEach(() => {
      const options = mockFunctions(withDefaultHooksOptions(undefined, StoreHookKeys), { recursive: true });
      store().hooks(options);
    })
    it('setup with no addons', async () => {
      await store().setup(createTestContext());
      expect(store().computedHooks.before.setup).toBeCalledTimes(1);
      expect(store().computedHooks.after.setup).toBeCalledTimes(1);
      expect(store().computedHooks.before.setupAddon).not.toBeCalled();
      expect(store().computedHooks.after.setupAddon).not.toBeCalled();
    });
    it('setup with addons', async () => {
      const addon1 = createTestAddon();
      const addon2 = createTestAddon();
      await store()
        .register(addon1)
        .register(addon2)
        .setup(createTestContext());
      expect(store().computedHooks.before.setup).toBeCalledTimes(1);
      expect(store().computedHooks.after.setup).toBeCalledTimes(1);
      expect(store().computedHooks.before.setupAddon).toBeCalledTimes(2);
      expect(store().computedHooks.after.setupAddon).toBeCalledTimes(2);
      expect(addon1.setup).toHaveBeenCalledTimes(1);
      expect(addon2.setup).toHaveBeenCalledTimes(1);
    });
  })
})
