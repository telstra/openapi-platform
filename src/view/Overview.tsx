import React, { SFC } from 'react';
import { SpecificationList } from 'basic/SpecificationList';
import { Specification } from 'model/Specification';
const testSpecification: Specification = {};
/**
 * An overview of the current state of Swagger Platform.
 * Includes, for example, a list of all the specications registered on the platform.
 */
export const Overview: SFC<{}> = () => (
  <SpecificationList specifications={[testSpecification, testSpecification]} />
);
