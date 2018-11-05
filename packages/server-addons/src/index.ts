import { gitHookSchema } from '@openapi-platform/git-util';
import {
  HookOptions,
  CompleteHooksOptions,
  mergeHookOptions,
  schema,
} from '@openapi-platform/hooks';
import { computed, action, observable } from 'mobx';

export interface Context {
  blobStore;
  logger;
  [s: string]: any;
}

export const crudHookSchema = {
  create: null,
  remove: null,
  update: null,
  patch: null,
};

export const addonHookSchema = {
  setup: null,
  listen: null,
  specs: crudHookSchema,
  sdks: {
    ...crudHookSchema,
    generateSdk: null,
    git: gitHookSchema,
  },
  sdkConfigs: crudHookSchema,
};
export const withAddonHookOptionsDefaults = schema(addonHookSchema);

export type AddonHookOptions = Partial<HookOptions<typeof addonHookSchema>>;

export interface Addon {
  title: string;
  hooks?: AddonHookOptions;
  setup?(context: Context): Promise<void>;
}

export enum StoreHookKeys {
  setup,
  setupAddon,
}

const storeHookSchema = {
  setup: null,
  setupAddon: null,
};
export const withStoreHookOptionsDefaults = schema(storeHookSchema);

export type StoreHookOptions = HookOptions<typeof storeHookSchema>;

export class Store {
  @observable
  private readonly addons: Addon[] = [];
  private assignedHooks: Partial<StoreHookOptions> | undefined = undefined;

  public register(addon: Addon): this {
    this.addons.push(addon);
    return this;
  }

  public async setup(context: Context) {
    await this.storeHooks.before.setup(context);
    for (const addon of this.addons) {
      context.installingAddon = addon;
      await this.storeHooks.before.setupAddon(context);
      if (addon.setup) {
        await addon.setup(context);
      }
      await this.storeHooks.after.setupAddon(context);
    }
    context.installingAddon = undefined;
    await this.storeHooks.after.setup(context);
  }

  /**
   * If you call any of the hooks returned from this function, it will call the same hook in every hook
   */
  @computed
  public get addonHooks() {
    return mergeHookOptions(this.addons.map(addon => addon.hooks), addonHookSchema);
  }

  @computed
  public get storeHooks(): CompleteHooksOptions<typeof storeHookSchema> {
    return withStoreHookOptionsDefaults(this.assignedHooks);
  }

  /**
   * This is for use by the server.
   * If you try add hooks, as an addon, it will be replaced with the server's hooks
   */
  @action
  public hooks(value: StoreHookOptions) {
    this.assignedHooks = value;
  }
}

let globalStore: Store | undefined;
export function store(): Store {
  if (globalStore === undefined) {
    globalStore = new Store();
  }
  return globalStore;
}
