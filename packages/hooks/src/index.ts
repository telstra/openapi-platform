export type HookCallback<P = any | undefined, T = any> = (input: P) => Promise<T>;
export interface Hook<B = any, BR = any, A = any, AR = any> {
  before: HookCallback<B, BR>;
  after: HookCallback<A, AR>;
}

export interface HookOptions<K> {
  before?: Partial<Hooks<K>>;
  after?: Partial<Hooks<K>>;
}

export type Hooks<K> = { [k in keyof K]: HookCallback };

export interface CompleteHooksOptions<K> {
  before: Hooks<K>;
  after: Hooks<K>;
}

export function defaultHook(): HookCallback {
  return async () => {};
}

export function withDefaultHooks<K>(
  hooks: Partial<Hooks<K>> = {},
  HookKeys: K,
): Hooks<K> {
  return Object.keys(HookKeys).reduce((obj, key) => {
    obj[key] = hooks[key] ? hooks[key] : defaultHook();
    return obj;
  }, {}) as Hooks<K>;
}

export function mergeHooks<K>(hooks: Partial<Hooks<K>>[], HookKeys: K): Hooks<K> {
  return Object.keys(HookKeys).reduce((mergedHooks, hookKey) => {
    mergedHooks[hookKey] = async (...params) => {
      for (const hook of hooks) {
        await hook[hookKey](...params);
      }
    };
    return mergedHooks;
  }, {}) as Hooks<K>;
}

export function mergeHookOptions<K>(
  hooks: HookOptions<K>[],
  HookKeys: K,
): CompleteHooksOptions<K> {
  function merge(key: keyof HookOptions<K>) {
    return mergeHooks(
      hooks.filter(hook => !!hook[key]).map(hook => hook![key] as Partial<Hooks<K>>),
      HookKeys,
    );
  }
  return {
    before: merge('before'),
    after: merge('after'),
  };
}

/**
 * This lets us avoid having to do undefined checks everywhere
 */
export function withDefaultHooksOptions<K>(
  hooks: HookOptions<K> = {},
  HookKeys: K,
): CompleteHooksOptions<K> {
  return {
    before: withDefaultHooks(hooks.before, HookKeys),
    after: withDefaultHooks(hooks.after, HookKeys),
  };
}
