import { client } from 'client/BackendClient';
import { observable, computed, action } from 'mobx';
import { HasId } from '@openapi-platform/model';
import { Spec } from '@openapi-platform/model';

export interface SpecState {
  specs: Map<number, HasId<Spec>>;
  specList: Array<HasId<Spec>>;
  addSpec: (info: AddedSpec) => Promise<void>;
  expandedSpecId: number | null;
}

export interface AddedSpec {
  path: string;
  title?: string;
  description?: string;
}

export class BasicSpecState implements SpecState {
  @observable
  public readonly specs: Map<number, HasId<Spec>> = new Map();
  @computed
  public get specList(): Array<HasId<Spec>> {
    return Array.from(this.specs.values()).map(value => value);
  }
  @action
  public async addSpec(addedSpec: AddedSpec): Promise<void> {
    const spec: HasId<Spec> = await client.service('specifications').create(addedSpec);
    this.specs.set(spec.id, spec);
  }
  @observable
  public expandedSpecId: number | null = null;
}

export const state: SpecState = new BasicSpecState();
client
  .service('specifications')
  .find()
  .then(json => {
    json.map(spec => state.specs.set(spec.id, spec));
  });
