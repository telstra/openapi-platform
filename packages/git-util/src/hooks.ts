export type HookCallback<P = any | undefined, T = any> = (input: P) => Promise<T>;
export interface Hook<B = any, BR = any, A = any, AR = any> {
  before: HookCallback<B, BR>;
  after: HookCallback<A, AR>;
}

export type HookKeys =
  | 'stage'
  | 'push'
  | 'commit'
  | 'clone'
  | 'downloadSdk'
  | 'moveSdkFilesToRepo'
  | 'cleanRepo'
  | 'extractSdk';
export const hookKeys = [
  'stage',
  'push',
  'commit',
  'clone',
  'downloadSdk',
  'moveSdkFilesToRepo',
  'cleanRepo',
  'extractSdk',
];
export interface HookOptions {
  before?: Partial<Hooks>;
  after?: Partial<Hooks>;
}

export interface CompleteHooksOptions {
  before: Hooks;
  after: Hooks;
}

export type Hooks = { [key in HookKeys]: HookCallback };

export function defaultHook(): HookCallback {
  return async () => {};
}

export function withDefaultHooks(hooks: Partial<Hooks> = {}): Hooks {
  return hookKeys.reduce((obj, key) => {
    obj[key] = hooks[key] ? hooks[key] : defaultHook();
    return obj;
  }, {}) as Hooks;
}

/**
 * This lets us avoid having to do undefined checks everywhere
 */
export function withDefaultHooksOptions(hooks: HookOptions = {}): CompleteHooksOptions {
  return {
    before: withDefaultHooks(hooks.before),
    after: withDefaultHooks(hooks.after),
  };
}
