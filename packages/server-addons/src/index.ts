import { HookOptions } from '@openapi-platform/git-util';
export interface Context {
  blobStore;
}

export interface Hooks {
  git: HookOptions;
}

type Addon = Readonly<{
  title: string;
  onRegisterStore;
  gitHooks: HookOptions;
}>;

class Store {
  private readonly addons: Addon[] = [];
  public register(addon: Addon): void {
    this.addons.push(addon);
  }
}

let globalStore: Store | undefined = undefined;
export function store() {
  if (globalStore === undefined) {
    globalStore = new Store();
  }
  return globalStore;
}