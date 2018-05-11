import React, { SFC } from 'react';
import { Spec } from 'model/Spec';
export interface SpecInformation {
  specification: Spec;
}
/**
 * Shows detailed information about a specified specification
 */
export const SpecInformation: SFC<SpecInformation> = ({ specification }) => (
  <div>{specification.title}</div>
);
