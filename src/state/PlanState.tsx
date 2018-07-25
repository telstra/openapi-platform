import { client } from 'client/BackendClient';
import { observable, computed, action } from 'mobx';
import { HasId, Id } from 'model/Entity';
import { Plan } from 'model/Plan';

class PlanState {
  @observable public readonly plans: Map<Id, HasId<Plan>> = new Map();
  @computed
  public get specPlans(): Map<Id, Array<HasId<Plan>>> {
    const specPlans = new Map();
    for (const plan of this.plans.values()) {
      if (specPlans.has(plan.specId)) {
        specPlans.get(plan.specId).push(plan);
      } else {
        specPlans.set(plan.specId, [plan]);
      }
    }
    return specPlans;
  }

  @action
  public async addPlan(addedPlan: AddedPlan): Promise<void> {
    const plan: HasId<Plan> = await client.service('plans').create(addedPlan);
    this.plans.set(plan.id, plan);
  }
}

export interface AddedPlan {
  specId?: number;
  target: string;
  version?: string;
  options?: any;
}

export const state: PlanState = new PlanState();
client
  .service('plans')
  .find()
  .then(plans =>
    plans.forEach(plan => {
      state.plans.set(plan.id, plan);
    }),
  );
