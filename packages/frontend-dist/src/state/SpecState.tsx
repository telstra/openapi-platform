import { HasId, Spec } from '@openapi-platform/model';
import { observable, computed, action } from 'mobx';

import { client } from '../client';
import { CrudState } from './CrudState';
import { state as sdkConfigState } from './SdkConfigState';
import { withRealtimeUpdates } from './withRealtimeUpdates';

export class SpecState implements CrudState<Spec> {
  @observable
  public readonly entities: Map<number, HasId<Spec>> = new Map();
  public readonly service = client.service('specifications');

  @action
  public async sync() {
    const specs: Array<HasId<Spec>> = await this.service.find({
      query: {
        $sort: {
          createdAt: 1,
        },
      },
    });
    specs.forEach(spec => {
      this.entities.set(spec.id, spec);
    });
  }

  @computed
  public get specList(): Array<HasId<Spec>> {
    return Array.from(this.entities.values()).map(value => value);
  }

  @action
  public async addSpec(addedSpec: Partial<Spec>): Promise<void> {
    const spec: HasId<Spec> = await this.service.create(addedSpec);
    this.entities.set(spec.id, spec);
  }

  @action
  public async updateSpec(id: number, updatedSpec: Partial<Spec>): Promise<void> {
    const spec: HasId<Spec> = await this.service.update(id, updatedSpec);
    this.entities.set(id, spec);
  }

  @action
  public async deleteSpec(id: number): Promise<void> {
    // Delete the spec
    const localSpec = this.entities.get(id);
    const sdkConfigsToDelete = sdkConfigState.specSdkConfigs.get(id);

    try {
      this.entities.delete(id);

      // Delete all SDK configurations associated with the spec (only locally, the hook for
      // specification removal will delete any associated SDK configurations from the database)
      if (sdkConfigsToDelete) {
        sdkConfigsToDelete.forEach(sdkConfig => {
          this.entities.delete(sdkConfig.id);
        });
      }

      await this.service.remove(id);
    } catch (err) {
      // Add the spec back in because we weren't able to delete it
      if (localSpec) {
        this.entities.set(id, localSpec);
      }
      // Also sdk configs need to be added back in
      if (sdkConfigsToDelete) {
        sdkConfigsToDelete.forEach(sdkConfig => {
          sdkConfigState.entities.set(sdkConfig.id, sdkConfig);
        });
      }
      throw localSpec;
    }
  }
}

export const state: SpecState = withRealtimeUpdates(new SpecState());
state.sync();
