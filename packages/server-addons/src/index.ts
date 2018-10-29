import {
  HookOptions,
  withDefaultHooksOptions,
  CompleteHooksOptions,
  mergeHookOptions,
} from '@openapi-platform/hooks';
import { GitHookKeys, GitHookOptions } from '@openapi-platform/git-util';
import { computed, action, observable } from 'mobx';

export interface Context {
  blobStore;
  [s: string]: any;
}

export enum AppAddonHookKeys {
  generateSdk,
  listen,
}

export type AppAddonHookOptions = HookOptions<typeof AppAddonHookKeys>;

export type AddonHookOptions = {
  app: AppAddonHookOptions;
  git: GitHookOptions;
};

export interface Addon {
  title: string;
  hooks?: Partial<AddonHookOptions>;
  setup(context: Context): Promise<void>;
}

export enum StoreHookKeys {
  setup,
  setupAddon,
}

export type StoreHookOptions = HookOptions<typeof StoreHookKeys>;

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
      await addon.setup(context);
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
    const that = this;
    function merge<K extends keyof AddonHookOptions, H>(key: K, HookKeys: H) {
      return mergeHookOptions(
        that.addons
          .filter(addon => !!addon.hooks)
          .map(addon => addon.hooks![key] as Partial<HookOptions<H>>),
        HookKeys,
      );
    }
    return {
      git: merge('git', GitHookKeys),
      app: merge('app', AppAddonHookKeys),
    };
  }

  @computed
  public get storeHooks(): CompleteHooksOptions<typeof StoreHookKeys> {
    return withDefaultHooksOptions(
      this.assignedHooks ? this.assignedHooks : {},
      StoreHookKeys,
    );
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

let globalStore: Store | undefined = undefined;
export function store(): Store {
  if (globalStore === undefined) {
    globalStore = new Store();
  }
  return globalStore;
}
