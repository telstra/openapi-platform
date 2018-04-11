import { Specification } from 'model/Specification';

// TODO: Replace this list
let count = 0;
let specifications: Specification[] = [
  {
    id: 1234,
    title: 'TestSpecification'
  }
];

export function getSpecificationById(id: number): Specification | undefined {
  /* Gets a specification with a matching id to what is provided
 * @params {number} id - the id of the specification to fetch
 * @return {Specification | undefined} - returns the Specification with the matching id if it exists
 */
  for (const spec of specifications) {
    if (spec.id === id) {
      return spec;
    }
  }
  return undefined;
}

export function getSpecifications(): Specification[] {
  /* Gets all Specifications 
 * @return {Specification[]} - returns an array containing all specifications
 */
  return specifications;
}

export function addSpecification(titleString?: string): Specification {
  /* Adds a specification to the list 
   * @param {string} titleString - optional argument to provide a specification title
   * @return {Specification} - specification object that was created
   */
  console.log('adding specification with id: ' + count);
  let spec: Specification;
  if (titleString) {
    spec = { id: count, title: titleString };
  } else {
    spec = { id: count };
  }
  specifications.push(spec);
  count += 1;
  return spec;
}
