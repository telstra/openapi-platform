import { observable, computed, action } from 'mobx';
import fetch from 'node-fetch';
import { config } from 'config';
import { HasId } from 'model/Entity';
import { Spec } from 'model/Spec';
import { BuildStatus } from 'model/Plan';
import { client } from 'client/BackendClient';
export interface SpecState {
  specifications: Map<number, HasId<Spec>>;
  specificationList: HasId<Spec>[];
  addSpecification: (info: AddedSpecification) => Promise<void>;
  expandedSpecId: number | null;
}
export interface AddedSpecification {
  path: string;
  title?: string;
  description?: string;
}
export class BasicSpecState implements SpecState {
  @observable readonly specifications: Map<number, HasId<Spec>> = new Map();
  @computed
  get specificationList(): HasId<Spec>[] {
    return Array.from(this.specifications.values()).map(value => value);
  }
  @action
  async addSpecification(addedSpec: AddedSpecification): Promise<void> {
    console.log(addedSpec);
    const specification: HasId<Spec> = await client
      .service('specifications')
      .create(addedSpec);
    this.specifications.set(specification.id, specification);
  }
  @observable expandedSpecId: number | null = null;
}

export const state: SpecState = new BasicSpecState();
client
  .service('specifications')
  .find()
  .then(json => json.map(spec => state.specifications.set(spec.id, spec)));
