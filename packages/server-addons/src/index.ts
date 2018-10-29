import { HookOptions } from '@openapi-platform/hooks';
export interface Context {
  blobStore;
}

export type Addon = Readonly<{
  title: string;
  onRegisterStore;
  setup: () => Promise<void>;
}>;

class Store {
  private readonly addons: Addon[] = [];
  public register(addon: Addon): void {
    this.addons.push(addon);
  }

  public async setup() {
    for (const addon of this.addons) {
      await addon.setup();
    }
  }

  /**
   * This is for use by the server.
   * If you try add hooks, as an addon, it will be replaced with the server's hooks
   */
  public async hooks(hookOptions) {}
}

let globalStore: Store | undefined = undefined;
export function store(): Store {
  if (globalStore === undefined) {
    globalStore = new Store();
  }
  return globalStore;
}
