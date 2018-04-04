import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
export interface SpecificationItemProps extends React.DOMAttributes<HTMLDivElement> {
  specification: Specification;
}
/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */
export const SpecificationItem: SFC<SpecificationItemProps> = ({
  specification,
  ...other
}) => <div {...other}>{specification.title}</div>;
