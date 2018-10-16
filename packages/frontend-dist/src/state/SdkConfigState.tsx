import { observable, computed, action } from 'mobx';

import { HasId, Id, SdkConfig, GitInfo } from '@openapi-platform/model';
import { updateStateInRealtime } from './updateStateInRealtime';

import { client } from '../client';

class SdkConfigState {
  @observable
  public readonly sdkConfigs: Map<Id, HasId<SdkConfig>> = new Map();
  private readonly service;
  public constructor() {
    this.service = client.service('sdkConfigs');
    updateStateInRealtime(this.service, this.sdkConfigs);
  }

  @action
  public async sync(): Promise<void> {
    const sdkConfigs: Array<HasId<SdkConfig>> = await this.service.find({
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
    const sdkConfig: HasId<SdkConfig> = await this.service
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
    const sdkConfig: HasId<SdkConfig> = await this.service
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
