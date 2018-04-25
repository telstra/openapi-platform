import { observable, computed, action } from 'mobx';
import fetch from 'node-fetch';
import { config } from 'config';
import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/Sdk';

export interface SpecificationState {
  specifications: Map<number, Specification>;
  specificationList: Specification[];
  addSpecification: (info: AddedSpecification) => Promise<boolean>;
  expandedSpecificationId: number | null;
}
export interface AddedSpecification {
  path: string;
  title?: string;
  description?: string;
}
class BasicSpecificationState implements SpecificationState {
  @observable readonly specifications: Map<number, Specification> = new Map();
  @computed
  get specificationList(): Specification[] {
    return Array.from(this.specifications.values()).map(value => value);
  }
  @action
  async addSpecification({
    title,
    path,
    description
  }: AddedSpecification): Promise<boolean> {
    const result = await fetch(config.frontend.baseApiUrl + 'addspecification', {
      method: 'POST',
      body: JSON.stringify({
        title,
        path,
        description
      }),
      headers: { 'Content-Type': 'application/json' }
    });
    const specification = (await result.json()) as Specification;
    this.specifications.set(specification.id, specification);
    return true;
  }
  @observable expandedSpecificationId: number | null = null;
}

export const state: SpecificationState = new BasicSpecificationState();

fetch(config.frontend.baseApiUrl + 'getspecifications', { method: 'POST' })
  .then(res => res.json())
  .then(json => json.map((spec, idx) => state.specifications.set(idx, spec)));
