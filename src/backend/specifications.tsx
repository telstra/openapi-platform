import { Specification } from 'model/Specification';
import { BuildStatus } from 'model/Sdk';

// TODO: Replace this list
let count = 0;
const specifications: Specification[] = [
  {
    id: count++,
    title: 'Birds',
    description: 'A Bird API, for Birds',
    path: 'git.example.com/swagger-specs/birds.yaml',
    sdks: [
      {
        id: 10,
        name: 'Java',
        latestVersion: 'v1.0.34',
        buildStatus: BuildStatus.SUCCESS
      },
      {
        id: 12,
        name: 'Node.js',
        latestVersion: 'v1.0.35',
        buildStatus: BuildStatus.RUNNING
      },
      { id: 11, name: 'Haskell', latestVersion: 'v0', buildStatus: BuildStatus.NOTRUN }
    ]
  },
  {
    id: count++,
    title: 'Test',
    description:
      'A test API for testing with a very long description that should truncate when displayed in the list',
    path: 'git.example.com/swagger-specs/test.yaml',
    sdks: [
      { id: 20, name: 'FORTRAN', latestVersion: 'alpha', buildStatus: BuildStatus.FAIL }
    ]
  },
  {
    id: count++,
    title: 'Swagger API Example Uber',
    description: 'A test API for Uber',
    path: 'https://esi.tech.ccp.is/_latest/swagger.json',
    sdks: [
      { id: 1, name: 'Python', latestVersion: 'alpha', buildStatus: BuildStatus.SUCCESS },
      { id: 2, name: 'java', latestVersion: 'alpha', buildStatus: BuildStatus.SUCCESS }
    ]
  }
];

/** Gets a specification with a matching id to what is provided
 * @param {number} id - the id of the specification to fetch
 * @return {Specification | undefined} - returns the Specification with the matching id if it exists
 */
export function getSpecificationById(id: number): Specification | undefined {
  for (const spec of specifications) {
    if (spec.id === id) {
      return spec;
    }
  }
  return undefined;
}

/** Gets all Specifications
 * @return {Specification[]} - returns an array containing all specifications
 */
export function getSpecifications(): Specification[] {
  return specifications;
}

/** Adds a specification to the list
 * @param {string} title - the specification title
 * @param {string} path - path to the swagger specification file
 * @param {string} description - optional specification description
 * @return {Specification} - specification object that was created
 */
export function addSpecification(
  title: string,
  path: string,
  description?: string
): Specification {
  let spec: Specification;

  if (description !== undefined) {
    spec = {
      id: count++,
      title,
      description,
      path,
      sdks: []
    };
  } else {
    spec = { id: count++, title, path, sdks: [] };
  }

  specifications.push(spec);
  return spec;
}
