import React, { SFC } from 'react';
import { SpecificationList } from 'basic/SpecificationList';
import { Specification } from 'model/Specification';
const testSpecification: Specification = {};
export const Overview: SFC<{}> = () => (
  <SpecificationList specifications={[testSpecification, testSpecification]} />
);
