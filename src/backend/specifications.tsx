import { Specification } from 'model/Specification';

// TODO: Replace this list
let count = 0;
const specifications: Specification[] = [
  {
    id: 1234,
    title: 'TestSpecification',
    path: 'testspec.yaml',
    sdks: []
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
 * @param {string} path - path to the swagger specification file
 * @param {string} titleString - a specification title
 * @param {string} description - optional specification description
 * @return {Specification} - specification object that was created
 */
export function addSpecification(
  path: string,
  titleString: string,
  description?: string
): Specification {
  let spec: Specification;

  if (description) {
    spec = {
      id: count,
      title: titleString,
      description: description,
      path: path,
      sdks: []
    };
  } else {
    spec = { id: count, title: titleString, path: path, sdks: [] };
  }

  specifications.push(spec);
  count++;
  return spec;
}
