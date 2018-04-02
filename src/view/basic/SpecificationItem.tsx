import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
/**
 * Very basic information about a specification.
 * For use in lists, grids, etc.
 */
export const SpecificationItem: SFC<Specification> = ({ title }) => <div>{title}</div>;
