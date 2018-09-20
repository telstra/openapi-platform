import { HasId, Spec } from '@openapi-platform/model';
import { observable, computed, action } from 'mobx';
import { client } from '../client';
import { state as sdkConfigState } from './SdkConfigState';

export interface SpecState {
  specs: Map<number, HasId<Spec>>;
  specList: Array<HasId<Spec>>;
  addSpec: (addedSpec: Spec) => Promise<void>;
  updateSpec: (id: number, updatedSpec: Spec) => Promise<void>;
  deleteSpec: (id: number) => Promise<void>;
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
  @action
  public async deleteSpec(id: number): Promise<void> {
    // Delete the spec
    await client.service('specifications').remove(id);
    this.specs.delete(id);
    // Delete all SDK configurations associated with the spec (only locally, the hook for
    // specification removal will delete any associated SDK configurations from the database)
    const sdkConfigsToDelete = sdkConfigState.specSdkConfigs.get(id);
    if (sdkConfigsToDelete !== undefined) {
      sdkConfigsToDelete.forEach(sdkConfig =>
        sdkConfigState.sdkConfigs.delete(sdkConfig.id),
      );
    }
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
