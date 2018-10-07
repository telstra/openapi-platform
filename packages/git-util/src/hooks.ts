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
export type HookOptions = { [key in HookKeys]?: Partial<Hook> };

export type Hooks = { [key in HookKeys]: Hook };

export function defaultHook(): HookCallback {
  return async () => {};
}

/**
 * This lets us avoid having to do undefined checks everywhere
 */
export function withDefaultHooks(hooks: HookOptions = {}): Hooks {
  return hookKeys.reduce((obj, key) => {
    const { before = defaultHook(), after = defaultHook() }: Hook = hooks[key]
      ? hooks[key]
      : {};
    obj[key] = {
      before,
      after,
    };
    return obj;
  }, {}) as Hooks;
}
