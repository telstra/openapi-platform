import { observable, computed, action } from 'mobx';

import { HasId, Id, SdkConfig, GitInfo } from '@openapi-platform/model';

import { client } from '../client';
import { CrudState } from './CrudState';
import { withRealtimeUpdates } from './withRealtimeUpdates';

class SdkConfigState implements CrudState<SdkConfig> {
  @observable
  public readonly entities: Map<Id, HasId<SdkConfig>> = new Map();
  public readonly service = client.service('sdkConfigs');

  @action
  public async sync(): Promise<void> {
    const entities: Array<HasId<SdkConfig>> = await this.service.find({
      query: {
        $sort: {
          createdAt: 1,
        },
      },
    });
    entities.forEach(sdkConfig => {
      this.entities.set(sdkConfig.id, sdkConfig);
    });
  }

  @computed
  public get specSdkConfigs(): Map<Id, Array<HasId<SdkConfig>>> {
    const specSdkConfigs = new Map();
    for (const sdkConfig of this.entities.values()) {
      if (specSdkConfigs.has(sdkConfig.specId)) {
        specSdkConfigs.get(sdkConfig.specId).push(sdkConfig);
      } else {
        specSdkConfigs.set(sdkConfig.specId, [sdkConfig]);
      }
    }
    return specSdkConfigs;
  }

  @action
  public async addSdkConfig(addedSdkConfig: AddedSdkConfig): Promise<void> {
    await this.service.create(addedSdkConfig);
  }

  @action
  public async updateSdkConfig(
    id: number,
    updatedSdkConfig: AddedSdkConfig,
  ): Promise<void> {
    const currentConfig = this.entities.get(id);
    // Copy over elements specified in SdkConfig but not editable from the form.
    const updatedSdkConfigStore: Partial<SdkConfig> = {
      ...updatedSdkConfig,
      /* TODO: Check if this is supposed to be here. 
         AddedSdkConfig supposedly already have a specId, according to the interface */
      specId: currentConfig!.specId,
    };
    await this.service.update(id, updatedSdkConfigStore);
  }
}

export interface AddedSdkConfig {
  specId?: number;
  target: string;
  version?: string;
  options: any;
  gitInfo?: GitInfo;
}

export const state: SdkConfigState = withRealtimeUpdates(new SdkConfigState());
state.sync();
