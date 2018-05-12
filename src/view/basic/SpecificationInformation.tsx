import React, { SFC } from 'react';

import { Specification } from 'model/Specification';

export interface SpecificationInformationProps {
  specification: Specification;
}

/**
 * Shows detailed information about a specified specification
 */
export const SpecificationInformation: SFC<SpecificationInformationProps> = ({
  specification,
}) => <div>{specification.title}</div>;
