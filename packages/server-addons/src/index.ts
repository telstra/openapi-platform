import { HookOptions, withDefaultHooksOptions, CompleteHooksOptions } from '@openapi-platform/hooks';
import { HookKeys as GitHookKeys, GitHookOptions } from '@openapi-platform/git-util';
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
  app: AppAddonHookOptions
  git: GitHookOptions
}

export interface Addon {
  title: string;
  hooks?: Partial<AddonHookOptions>
  setup(context: Context): Promise<void>
};

export enum StoreHookKeys {
  setup,
  setupAddon
}

export type StoreHookOptions = HookOptions<typeof StoreHookKeys>

interface StoreAddon extends Addon {
  hooks: AddonHookOptions;
}

export class Store {
  @observable
  private readonly addons: StoreAddon[] = [];
  private assignedHooks: Partial<StoreHookOptions> | undefined = undefined;

  private completeAddon(addon: Addon): StoreAddon {
    addon.hooks = addon.hooks ? addon.hooks : {};
    addon.hooks.app = withDefaultHooksOptions(addon.hooks.app, AppAddonHookKeys);
    addon.hooks.git = withDefaultHooksOptions(addon.hooks.git, GitHookKeys);
    return addon as StoreAddon;
  }

  public register(addon: Addon): this {
    this.addons.push(this.completeAddon(addon));
    return this;
  }

  public async setup(context: Context) {
    await this.computedHooks.before.setup(context);
    for (const addon of this.addons) {
      context.installingAddon = addon;
      await this.computedHooks.before.setupAddon(context);
      await addon.setup(context);
      await this.computedHooks.after.setupAddon(context);
    }
    context.installingAddon = undefined;
    await this.computedHooks.after.setup(context);
  }

  @computed
  public get computedHooks(): CompleteHooksOptions<typeof StoreHookKeys> {
    return withDefaultHooksOptions(this.assignedHooks ? this.assignedHooks : {}, StoreHookKeys);
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
