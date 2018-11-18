import { store, Addon } from '@openapi-platform/server-addons';
import { serviceAddonHookOptions } from '../../src/serviceAddonHookOptions';
function asyncMockFn() {
  return jest.fn().mockReturnValue(Promise.resolve());
}
describe('serviceAddonHookOptions', () => {
  it('calls addon hooks', async () => {
    const addon1 = {
      title: 'test 1',
      hooks: {
        before: {
          specifications: {
            update: asyncMockFn(),
          },
          sdks: {
            all: asyncMockFn(),
            create: asyncMockFn(),
            patch: asyncMockFn(),
            remove: asyncMockFn(),
            update: asyncMockFn(),
          },
        },
      },
    };

    const addon2 = {
      title: 'test 1',
      hooks: {
        before: {
          specifications: {
            update: asyncMockFn(),
          },
        },
        after: {
          sdks: {
            create: asyncMockFn(),
          },
        },
      },
    };

    store().register(addon1);
    store().register(addon2);
    const c = {};
    const sdkHooks = serviceAddonHookOptions(c as any, 'sdks');
    const specHooks = serviceAddonHookOptions(c as any, 'specifications');
    const serviceContext = {};
    await sdkHooks.before.create(serviceContext);
    expect(addon1.hooks.before.sdks.create).toHaveBeenCalledWith(c, serviceContext);
    expect(addon1.hooks.before.sdks.remove).not.toHaveBeenCalled();
    expect(addon1.hooks.before.sdks.update).not.toHaveBeenCalled();
    expect(addon1.hooks.before.sdks.patch).not.toHaveBeenCalled();

    await sdkHooks.before.update(serviceContext);
    expect(addon1.hooks.before.specifications.update).not.toHaveBeenCalled();
    expect(addon2.hooks.before.specifications.update).not.toHaveBeenCalled();
    await specHooks.before.update(serviceContext);
    expect(addon1.hooks.before.specifications.update).toHaveBeenCalledTimes(1);
    expect(addon2.hooks.before.specifications.update).toHaveBeenCalledTimes(1);

    expect(addon2.hooks.after.sdks.create).not.toHaveBeenCalled();
    await sdkHooks.after.create(c);
    expect(addon2.hooks.after.sdks.create).toHaveBeenCalledTimes(1);

    specHooks.before.create(c);
  });
});
