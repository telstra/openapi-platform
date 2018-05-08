import { observable, computed, action } from 'mobx';
import fetch from 'node-fetch';
import { config } from 'config';
import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/Sdk';
import { client } from 'client/BackendClient';

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

export interface AddedSdk {
  client: string;
  version: string;
}

class BasicSpecificationState implements SpecificationState {
  @observable readonly specifications: Map<number, Specification> = new Map();
  @computed
  get specificationList(): Specification[] {
    return Array.from(this.specifications.values()).map(value => value);
  }
  @action
  async addSpecification(addedSpec: AddedSpecification): Promise<void> {
    console.log(addedSpec);
    const specification: Specification = await client
      .service('specifications')
      .create(addedSpec);
    this.specifications.set(specification.id, specification);
  }
  @observable expandedSpecificationId: number | null = null;
}

export const state: SpecificationState = new BasicSpecificationState();
client
  .service('specifications')
  .find()
  .then(json => json.map(spec => state.specifications.set(spec.id, spec)));
