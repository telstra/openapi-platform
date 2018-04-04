import { Specification } from 'model/Specification';
import { observable, computed } from 'mobx';
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
state.specifications.set(1, { id: 1, title: 'test' });
