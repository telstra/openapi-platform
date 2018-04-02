import React, { SFC } from 'react';
import { Specification } from 'model/Specification';
export const SpecificationViewer: SFC<Specification> = ({ title }) => <div>{title}</div>;
