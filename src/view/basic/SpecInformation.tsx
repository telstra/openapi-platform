import React, { SFC } from 'react';

import { Spec } from 'model/Spec';
export interface SpecInformation {
  spec: Spec;
}
/**
 * Shows detailed information about a specified Spec
 */
export const SpecInformation: SFC<SpecInformation> = ({ spec }) => (
  <div>{spec.title}</div>
);
