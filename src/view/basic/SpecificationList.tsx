import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
import { SpecificationItem } from 'basic/SpecificationItem';
export interface SpecificationListProps {
  specifications: Specification[];
}
/**
 * Lists a series of specifications
 */
export const SpecificationList: SFC<SpecificationListProps> = ({ specifications }) => (
  <div>{specifications.map(specification => <SpecificationItem {...specification} />)}</div>
);
