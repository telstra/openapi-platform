import React, { SFC } from 'react';
import { Spec } from 'model/Spec';
export interface SpecificationInformationProps {
  specification: Spec;
}
/**
 * Shows detailed information about a specified specification
 */
export const SpecificationInformation: SFC<SpecificationInformationProps> = ({
  specification
}) => <div>{specification.title}</div>;
