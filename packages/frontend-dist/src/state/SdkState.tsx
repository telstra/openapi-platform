import { observable, action } from 'mobx';

import { Id, HasId, Sdk, PathHolder } from '@openapi-platform/model';
import { client } from '../client';
import { CrudState } from './CrudState';
import { withRealtimeUpdates } from './withRealtimeUpdates';

export class SdkState implements CrudState<Sdk> {
  @observable
  public readonly entities: Map<Id, HasId<Sdk & Partial<PathHolder>>> = new Map();
  public readonly service = client.service('sdks');

  @action
  public async createSdk(sdkConfig: HasId<any>) {
    await this.service.create({ sdkConfigId: sdkConfig.id });
  }

  @action
  public async retrieveLatestSdk(sdkConfig: HasId<any>) {
    const sdks: Array<HasId<Sdk>> = await this.service.find({
      query: {
        $limit: 1,
        $sort: {
          createdAt: -1,
        },
        sdkConfigId: sdkConfig.id,
      },
    });
    const sdk = sdks.length > 0 ? sdks[0] : null;
    if (sdk) {
      this.entities.set(sdk.id, sdk);
    }
    return sdk;
  }
}

export const state = withRealtimeUpdates(new SdkState());
