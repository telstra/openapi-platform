import { observable, computed } from 'mobx';
import { PaletteType } from 'material-ui';
import { HasId, Id } from 'model/Entity';
import { Plan } from 'model/Plan';
import { client } from 'client/BackendClient';
class PlanState {
  @observable public readonly plans: Map<Id, HasId<Plan>> = new Map();
  @computed
  public get specPlans(): Map<Id, HasId<Plan>[]> {
    const specPlans = new Map();
    for (const sdk of this.plans.values()) {
      if (specPlans.has(sdk.specId)) {
        specPlans.get(sdk.specId).push(sdk);
      } else {
        specPlans.set(sdk.specId, [sdk]);
      }
    }
    return specPlans;
  }
}
export const state: PlanState = new PlanState();
client
  .service('plans')
  .find()
  .then(plans => plans.forEach(sdk => state.plans.set(sdk.id, sdk)));
