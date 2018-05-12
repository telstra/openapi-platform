import { observable, computed, action } from 'mobx';

import { client } from 'client/BackendClient';
import { Specification } from 'model/Specification';

export interface SpecificationState {
  specifications: Map<number, Specification>;
  specificationList: Specification[];
  addSpecification: (info: AddedSpecification) => Promise<void>;
  expandedSpecificationId: number | null;
}

export interface AddedSpecification {
  path: string;
  title?: string;
  description?: string;
}

class BasicSpecificationState implements SpecificationState {
  @observable
  public readonly specifications: Map<number, Specification> = new Map();
  @computed
  public get specificationList(): Specification[] {
    return Array.from(this.specifications.values()).map(value => value);
  }
  @action
  public async addSpecification(addedSpec: AddedSpecification): Promise<void> {
    const specification: Specification = await client
      .service('specifications')
      .create(addedSpec);
    this.specifications.set(specification.id, specification);
  }
  @observable public expandedSpecificationId: number | null = null;
}

export const state: SpecificationState = new BasicSpecificationState();
client
  .service('specifications')
  .find()
  .then(json => json.map(spec => state.specifications.set(spec.id, spec)));
