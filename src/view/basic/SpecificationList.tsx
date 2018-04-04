import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
import { SpecificationItem } from 'basic/SpecificationItem';
export interface SpecificationListProps extends React.DOMAttributes<HTMLDivElement> {
  specifications: Specification[];
  onSpecificationSelected: (specification: Specification) => void;
}
/**
 * Lists a series of specifications
 */
export const SpecificationList: SFC<SpecificationListProps> = ({
  specifications,
  onSpecificationSelected
}) => (
  <div>
    {specifications.map(specification => (
      <SpecificationItem
        specification={specification}
        onClick={() => onSpecificationSelected(specification)}
      />
    ))}
  </div>
);
