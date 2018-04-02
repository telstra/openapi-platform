import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
export const SpecificationItem: SFC<Specification> = ({ title }) => <div>{title}</div>;
