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
  app;
  [s: string]: any;
}

export const crudHookSchema = {
  all: null,
  create: null,
  remove: null,
  update: null,
  patch: null,
};

export const addonHookSchema = {
  listen: null,
  specifications: crudHookSchema,
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
  /**
   * Description of the addon's purpose/what it does
   */
  description?: string;
  hooks?: AddonHookOptions;
  /**
   * Called during the server's initialisation
   */
  setup?: (context: Context) => Promise<void>;
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

  @action
  public register(addon: Addon): this {
    this.addons.push(addon);
    return this;
  }

  public async setup(context: Context) {
    await this.storeHooks.before.setup(context);
    for (const addon of this.addons) {
      await this.storeHooks.before.setupAddon(context, addonHookSchema);
      if (addon.setup) {
        await addon.setup(context);
      }
      await this.storeHooks.after.setupAddon(context, addon);
    }
    await this.storeHooks.after.setup(context);
  }

  /**
   * If you call any of the hooks returned from this function, it will call the same hook in every hook
   */
  @computed
  public get addonHooks() {
    const hooks = mergeHookOptions(
      this.addons.map(addon => addon.hooks as Partial<AddonHookOptions>),
      addonHookSchema,
    );
    return hooks;
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
