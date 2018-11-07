import { crudHookSchema, store, Context } from '@openapi-platform/server-addons';
// TODO: Add featherjs types if they exist
interface CrudHooks {
  all: (context: any) => Promise<any>;
  create: (context: any) => Promise<any>;
  remove: (context: any) => Promise<any>;
  patch: (context: any) => Promise<any>;
  update: (context: any) => Promise<any>;
}

function serviceAddonHooks(c: Context, serviceName: string, tense: string): CrudHooks {
  return Object.keys(crudHookSchema).reduce((hooksObj, key) => {
    hooksObj[key] = async context => {
      await store().addonHooks[tense][serviceName][key](c, context);
    };
    return hooksObj;
  }, {}) as CrudHooks;
}

export function serviceAddonHookOptions(c: Context, serviceName: string) {
  return {
    before: serviceAddonHooks(c, serviceName, 'before'),
    after: serviceAddonHooks(c, serviceName, 'after'),
  };
}
