import { Specification } from 'model/Specification';

// TODO: Replace this list
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
