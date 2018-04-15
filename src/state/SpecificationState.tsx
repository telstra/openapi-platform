import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/SDK';
import { observable, computed } from 'mobx';
import fetch from 'node-fetch';

export interface SpecificationState {
  specifications: Map<number, Specification>;
  specificationList: Specification[];
}

class BasicSpecificationState {
  @observable readonly specifications: Map<number, Specification> = new Map();
  @computed
  get specificationList(): Specification[] {
    return Array.from(this.specifications.values()).map(value => value);
  }
}

export const state: SpecificationState = new BasicSpecificationState();

fetch('http://localhost:8080/getspecifications', { method: 'POST' })
  .then(res => res.json())
  .then(json => json.map((spec, idx) => state.specifications.set(idx, spec)));
