import { HasId } from '@openapi-platform/model';
import { Spec } from '@openapi-platform/model';
import { observable, computed, action } from 'mobx';
import { client } from '../client';

export interface SpecState {
  specs: Map<number, HasId<Spec>>;
  specList: Array<HasId<Spec>>;
  addSpec: (addedSpec: Spec) => Promise<void>;
  updateSpec: (id: number, updatedSpec: Spec) => Promise<void>;
}

export class BasicSpecState implements SpecState {
  @observable
  public readonly specs: Map<number, HasId<Spec>> = new Map();
  @computed
  public get specList(): Array<HasId<Spec>> {
    return Array.from(this.specs.values()).map(value => value);
  }
  @action
  public async addSpec(addedSpec: Spec): Promise<void> {
    const spec: HasId<Spec> = await client.service('specifications').create(addedSpec);
    this.specs.set(spec.id, spec);
  }
  @action
  public async updateSpec(id: number, updatedSpec: Spec): Promise<void> {
    const spec: HasId<Spec> = await client
      .service('specifications')
      .update(id, updatedSpec);
    this.specs.set(id, spec);
  }
}

export const state: SpecState = new BasicSpecState();
client
  .service('specifications')
  .find({
    query: {
      $sort: {
        createdAt: 1,
      },
    },
  })
  .then(
    action((specs: Array<HasId<Spec>>) => {
      specs.forEach(spec => {
        state.specs.set(spec.id, spec);
      });
    }),
  );
