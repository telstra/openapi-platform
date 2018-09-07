import { observable, computed, action } from 'mobx';

import { HasId, Id, SdkConfig } from '@openapi-platform/model';
import { client } from '../client';

class SdkConfigState {
  @observable
  public readonly sdkConfigs: Map<Id, HasId<SdkConfig>> = new Map();
  @computed
  public get specSdkConfigs(): Map<Id, Array<HasId<SdkConfig>>> {
    const specSdkConfigs = new Map();
    for (const sdkConfig of this.sdkConfigs.values()) {
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
    const sdkConfig: HasId<SdkConfig> = await client
      .service('sdkConfigs')
      .create(addedSdkConfig);
    this.sdkConfigs.set(sdkConfig.id, sdkConfig);
  }
}

export interface AddedSdkConfig {
  specId?: number;
  target: string;
  version?: string;
  options?: any;
}

export const state: SdkConfigState = new SdkConfigState();
client
  .service('sdkConfigs')
  .find()
  .then(
    action((sdkConfigs: Array<HasId<SdkConfig>>) => {
      sdkConfigs.forEach(sdkConfig => {
        state.sdkConfigs.set(sdkConfig.id, sdkConfig);
      });
    }),
  );
