import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/Sdk';

let count = 0;
// TODO: Replace this list
export const dummySpecifications: Specification[] = [
  {
    id: count++,
    title: 'Birds',
    description: 'A Bird API, for Birds',
    path: 'git.example.com/swagger-specs/birds.yaml',
    sdks: [
      {
        id: 10,
        client: 'Java',
        version: 'v1.0.34',
        buildStatus: BuildStatus.SUCCESS
      },
      {
        id: 12,
        client: 'Node.js',
        version: 'v1.0.35',
        buildStatus: BuildStatus.RUNNING
      },
      { id: 11, client: 'Haskell', version: 'v0', buildStatus: BuildStatus.NOTRUN }
    ]
  },
  {
    id: count++,
    title: 'Test',
    description:
      'A test API for testing with a very long description that should truncate when displayed in the list',
    path: 'git.example.com/swagger-specs/test.yaml',
    sdks: [
      { id: 20, client: 'FORTRAN', version: 'alpha', buildStatus: BuildStatus.FAIL }
    ]
  },
  {
    id: count++,
    title: 'Swagger API Example Uber',
    description: 'A test API for Uber',
    path:
      'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/examples/v2.0/yaml/uber.yaml',
    sdks: [
      { id: 1, client: 'Python', version: 'alpha', buildStatus: BuildStatus.SUCCESS },
      { id: 2, client: 'Java', version: 'alpha', buildStatus: BuildStatus.SUCCESS }
    ]
  }
];
