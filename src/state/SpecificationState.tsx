import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/SDK';
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
state.specifications.set(0, {
  id: 0,
  title: 'Birds',
  description: 'A Bird API, for Birds',
  path: 'git.example.com/swagger-specs/birds.yaml',
  sdks: [
    { id: 10, name: 'Java', latestVersion: 'v1.0.34', buildStatus: BuildStatus.SUCCESS },
    {
      id: 12,
      name: 'Node.js',
      latestVersion: 'v1.0.35',
      buildStatus: BuildStatus.RUNNING
    },
    { id: 11, name: 'Haskell', latestVersion: 'v1.1.12', buildStatus: BuildStatus.NOTRUN }
  ]
});
state.specifications.set(1, {
  id: 1,
  title: 'test',
  description:
    'A test API for testing with a very long description that should truncate when displayed in the list',
  path: 'git.example.com/swagger-specs/test.yaml',
  sdks: [
    { id: 20, name: 'FORTRAN', latestVersion: 'alpha', buildStatus: BuildStatus.FAIL }
  ]
});
