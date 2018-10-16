import { HasId, Spec } from '@openapi-platform/model';
import { observable, computed, action } from 'mobx';
import { client } from '../client';
import { state as sdkConfigState } from './SdkConfigState';
import { updateStateInRealtime } from './updateStateInRealtime';

export class SpecState {
  @observable
  public readonly specs: Map<number, HasId<Spec>> = new Map();
  private readonly service;
  constructor() {
    this.service = client.service('specifications');
    updateStateInRealtime(this.service, this.specs);
  }

  @action
  public async sync() {
    const specs = await this.service.find({
      query: {
        $sort: {
          createdAt: 1,
        },
      },
    });
    specs.forEach(spec => {
      state.specs.set(spec.id, spec);
    });
  }

  @computed
  public get specList(): Array<HasId<Spec>> {
    return Array.from(this.specs.values()).map(value => value);
  }

  @action
  public async addSpec(addedSpec: Spec): Promise<void> {
    const spec: HasId<Spec> = await this.service.create(addedSpec);
    this.specs.set(spec.id, spec);
  }

  @action
  public async updateSpec(id: number, updatedSpec: Spec): Promise<void> {
    const spec: HasId<Spec> = await this.service.update(id, updatedSpec);
    this.specs.set(id, spec);
  }

  @action
  public async deleteSpec(id: number): Promise<void> {
    // Delete the spec
    const localSpec = this.specs.get(id);
    const sdkConfigsToDelete = sdkConfigState.specSdkConfigs.get(id);

    try {
      this.specs.delete(id);

      // Delete all SDK configurations associated with the spec (only locally, the hook for
      // specification removal will delete any associated SDK configurations from the database)
      if (sdkConfigsToDelete) {
        sdkConfigsToDelete.forEach(sdkConfig => {
          sdkConfigState.sdkConfigs.delete(sdkConfig.id);
        });
      }

      await this.service.remove(id);
    } catch (err) {
      // Add the spec back in because we weren't able to delete it
      if (localSpec) {
        this.specs.set(id, localSpec);
      }
      // Also sdk configs need to be added back in
      if (sdkConfigsToDelete) {
        sdkConfigsToDelete.forEach(sdkConfig => {
          sdkConfigState.sdkConfigs.set(sdkConfig.id, sdkConfig);
        });
      }
      throw localSpec;
    }
  }
}

export const state: SpecState = new SpecState();
state.sync();
