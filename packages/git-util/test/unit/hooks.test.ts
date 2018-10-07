import { withDefaultHooks, hookKeys } from '../../src/hooks';
describe('withDefaultHooks', () => {
  it('adds default hooks', () => {
    const hooks = withDefaultHooks();
    Object.keys(hooks).forEach(key => {
      const hook = hooks[key];
      expect(hook).toEqual(
        expect.objectContaining({
          before: expect.any(Function),
          after: expect.any(Function),
        }),
      );
    });
  });
  it('does not replace existing hooks', () => {
    const beforeCommitCallback = async () => {};
    const hooks = withDefaultHooks({
      commit: {
        before: beforeCommitCallback,
      },
    });
    expect(hooks.commit.before).toBe(beforeCommitCallback);
  });
});
