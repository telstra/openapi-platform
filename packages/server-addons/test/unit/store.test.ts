import { store } from '@openapi-platform/server-addons';
it('same store', () => {
  expect(store()).toBe(store());
});
