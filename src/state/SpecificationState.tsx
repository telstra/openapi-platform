import { observable, computed, action } from 'mobx';
import fetch from 'node-fetch';
import { config } from 'config';
import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/Sdk';

export interface SpecificationState {
  specifications: Map<number, Specification>;
  specificationList: Specification[];
  addSpecification: (specification: Specification) => Promise<boolean>;
  expandedSpecificationId: number | null;
}

class BasicSpecificationState {
  @observable readonly specifications: Map<number, Specification> = new Map();
  @computed
  get specificationList(): Specification[] {
    return Array.from(this.specifications.values()).map(value => value);
  }
  @action
  async addSpecification(specification: Specification): Promise<boolean> {
    const result = await fetch(config.frontend.baseApiUrl + 'addspecification', {
      method: 'POST',
      body: JSON.stringify(specification),
      headers: { 'Content-Type': 'application/json' }
    });
    const newSpecification = result.json() as Specification;
    this.specifications.set(newSpecification.id, newSpecification);
    return true;
  }
  @observable expandedSpecificationId: number | null = null;
}

export const state: SpecificationState = new BasicSpecificationState();

fetch(config.frontend.baseApiUrl + 'getspecifications', { method: 'POST' })
  .then(res => res.json())
  .then(json => json.map((spec, idx) => state.specifications.set(idx, spec)));
