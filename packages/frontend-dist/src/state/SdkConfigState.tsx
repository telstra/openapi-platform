import { observable, computed, action } from 'mobx';

import { HasId, Id, SdkConfig, GitInfo } from '@openapi-platform/model';

import { client } from '../client';

class SdkConfigState {
  @observable
  public readonly sdkConfigs: Map<Id, HasId<SdkConfig>> = new Map();

  public constructor() {
    const sdkConfigsService = client.service('sdkConfigs');
    sdkConfigsService.on(
      'created',
      action((sdkConfig: HasId<SdkConfig>) => {
        this.sdkConfigs.set(sdkConfig.id, sdkConfig);
      }),
    );
    sdkConfigsService.on(
      'patched',
      action((sdkConfig: HasId<Partial<SdkConfig>>) => {
        const originalSdkConfig = this.sdkConfigs.get(sdkConfig.id);
        // TODO: Should retrieve the sdk if it doesn't already exist in state
        if (originalSdkConfig) {
          this.sdkConfigs.set(sdkConfig.id, {
            ...originalSdkConfig,
            ...sdkConfig,
          });
        }
      }),
    );
    sdkConfigsService.on(
      'removed',
      action((sdkConfig: HasId<SdkConfig>) => {
        this.sdkConfigs.delete(sdkConfig.id);
      }),
    );
    sdkConfigsService.on(
      'updated',
      action((sdkConfig: HasId<SdkConfig>) => {
        this.sdkConfigs.set(sdkConfig.id, sdkConfig);
      }),
    );
  }

  @action
  public async sync(): Promise<void> {
    const sdkConfigs: Array<HasId<SdkConfig>> = await client.service('sdkConfigs').find({
      query: {
        $sort: {
          createdAt: 1,
        },
      },
    });
    sdkConfigs.forEach(sdkConfig => {
      state.sdkConfigs.set(sdkConfig.id, sdkConfig);
    });
  }

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

  @action
  public async updateSdkConfig(
    id: number,
    updatedSdkConfig: AddedSdkConfig,
  ): Promise<void> {
    const currentConfig = this.sdkConfigs.get(id);
    // Copy over elements specified in SdkConfig but not editable from the form.
    const updatedSdkConfigStore: SdkConfig = {
      ...updatedSdkConfig,
      buildStatus: currentConfig!.buildStatus,
      specId: currentConfig!.specId,
    };
    const sdkConfig: HasId<SdkConfig> = await client
      .service('sdkConfigs')
      .update(id, updatedSdkConfigStore);
    this.sdkConfigs.set(id, sdkConfig);
  }
}

export interface AddedSdkConfig {
  specId?: number;
  target: string;
  version?: string;
  options: any;
  gitInfo?: GitInfo;
}

export const state: SdkConfigState = new SdkConfigState();
state.sync();
