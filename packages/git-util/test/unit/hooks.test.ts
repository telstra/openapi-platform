import { withDefaultHooksOptions, hookKeys } from '../../src/hooks';
describe('withDefaultHooks', () => {
  it('adds default hooks', () => {
    const hooks = withDefaultHooksOptions();
    ['before', 'after'].forEach(tense => {
      Object.keys(hooks[tense]).forEach(key => {
        expect(hooks[tense][key]).toEqual(expect.any(Function));
      });
    });
  });
  it('does not replace existing hooks', () => {
    const beforeCommitCallback = async () => {};
    const hooks = withDefaultHooksOptions({
      before: {
        commit: beforeCommitCallback,
      },
    });
    expect(hooks.before.commit).toBe(beforeCommitCallback);
  });
});
