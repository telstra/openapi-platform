export type HookCallback<P = any | undefined, T = any> = (input: P) => Promise<T>;
export type HookCallbackFactory<P = any, T = any> = () => HookCallback<P, T>;
export interface Hook<B = any, BR = any, A = any, AR = any> {
  before: HookCallback<B, BR>;
  after: HookCallback<A, AR>;
}

export type HookSchemaValue = null | HookSchema | HookCallbackFactory;

export interface HookSchema {
  [k: string]: HookSchemaValue;
}

export type Hooks<H extends HookSchema> = {
  [K in keyof H]: H[K] extends HookSchema
    ? Hooks<H[K]>
    : H[K] extends HookCallbackFactory ? ReturnType<H[K]> : HookCallback
};

export interface HookOptions<K extends HookSchema> {
  before?: Partial<Hooks<K>>;
  after?: Partial<Hooks<K>>;
}

export interface CompleteHooksOptions<K extends HookSchema> {
  before: Hooks<K>;
  after: Hooks<K>;
}

export function defaultHook(): HookCallback {
  return async () => {};
}

export function defaultHooksFromSchema<H extends HookSchema>(
  schemaObj: H,
  hooksObj: Partial<Hooks<H>> = {},
): Hooks<H> {
  return Object.keys(schemaObj).reduce((hooks, key) => {
    if (!hooks[key]) {
      // TODO: There's some type errors that occur for whatever reason with as any. Need to remove them
      if (schemaObj[key] === null) {
        hooks[key] = (async () => {}) as any;
      } else if (typeof schemaObj[key] === 'function') {
        hooks[key] = (schemaObj[key] as HookCallbackFactory)() as any;
      } else {
        hooks[key] = defaultHooksFromSchema(schemaObj[key] as HookSchema, {}) as any;
      }
    }
    return hooks;
  }, hooksObj) as Hooks<H>;
}

export function schema<H extends HookSchema>(schemaObj: H) {
  return (partialHooks: Partial<HookOptions<H>> = {}): CompleteHooksOptions<H> => {
    return {
      before: defaultHooksFromSchema(schemaObj, partialHooks.before),
      after: defaultHooksFromSchema(schemaObj, partialHooks.after),
    };
  };
}

export function mergeHooks<H extends HookSchema>(
  hooksList: Array<Partial<Hooks<H>>>,
  hookSchema: H,
): Hooks<H> {
  return Object.keys(hookSchema).reduce((merged, key) => {
    if (typeof hookSchema[key] === 'function' || hookSchema[key] === null) {
      const hookCallbacks = hooksList
        .map(hooks => hooks[key])
        .filter(callback => !!callback) as Array<(...args: any[]) => any>;
      merged[key] = async (...params) =>
        hookCallbacks.forEach(callback => callback(...params));
    } else {
      merged[key] = mergeHooks(
        hooksList.map(hooks => hooks[key] as Hooks<HookSchema>),
        hookSchema[key] as HookSchema,
      );
    }
    return merged;
  }, {}) as Hooks<H>;
}

export function mergeHookOptions<H extends HookSchema>(
  hookOptionsList: Array<Partial<HookOptions<H>> | undefined>,
  hookSchema: H,
): CompleteHooksOptions<H> {
  return {
    before: mergeHooks(
      hookOptionsList
        .filter(hookOptions => !!hookOptions)
        .map(hookOptions => hookOptions!.before as Partial<Hooks<H>>),
      hookSchema,
    ),
    after: mergeHooks(
      hookOptionsList
        .filter(hookOptions => !!hookOptions)
        .map(hookOptions => hookOptions!.after as Partial<Hooks<H>>),
      hookSchema,
    ),
  };
}
