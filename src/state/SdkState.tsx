import { observable, computed } from 'mobx';
import { PaletteType } from 'material-ui';
import { HasId, Id } from 'model/Entity';
import { Sdk } from 'model/Sdk';
import { client } from 'client/BackendClient';
class SdkState {
  @observable public readonly sdks: Map<Id, HasId<Sdk>> = new Map();
  @computed
  public get specSdks(): Map<Id, HasId<Sdk>[]> {
    const specSdks = new Map();
    for (const sdk of this.sdks.values()) {
      if (specSdks.has(sdk.specId)) {
        specSdks.get(sdk.specId).push(sdk);
      } else {
        specSdks.set(sdk.specId, [sdk]);
      }
    }
    return specSdks;
  }
}
export const state: SdkState = new SdkState();
client
  .service('sdks')
  .find()
  .then(sdks => sdks.forEach(sdk => state.sdks.set(sdk.id, sdk)));
