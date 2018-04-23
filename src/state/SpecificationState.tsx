import { observable, computed } from 'mobx';
import fetch from 'node-fetch';
import { config } from 'config';
import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/Sdk';

export interface SpecificationState {
  specifications: Map<number, Specification>;
  specificationList: Specification[];
  expandedSpecificationId: number | null;
}

class BasicSpecificationState {
  @observable readonly specifications: Map<number, Specification> = new Map();
  @computed
  get specificationList(): Specification[] {
    return Array.from(this.specifications.values()).map(value => value);
  }
  @observable expandedSpecificationId: number | null = null;
}

export const state: SpecificationState = new BasicSpecificationState();

fetch(config.frontend.baseApiUrl + 'getspecifications', { method: 'POST' })
  .then(res => res.json())
  .then(json => json.map((spec, idx) => state.specifications.set(idx, spec)));
