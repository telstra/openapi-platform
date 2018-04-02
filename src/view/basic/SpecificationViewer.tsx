import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
/**
 * Shows detailed information about a specified specification
 */
export const SpecificationViewer: SFC<Specification> = ({ title }) => <div>{title}</div>;
