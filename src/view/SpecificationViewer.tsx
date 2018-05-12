import { observer } from 'mobx-react';
import React, { SFC } from 'react';

import { SpecificationInformation } from 'basic/SpecificationInformation';
import { state } from 'state/SpecificationState';

// TODO: Fix the prop types for this
export const SpecificationViewer: SFC<any> = observer(({ match }) => {
  const specification = state.specifications.get(match.id);
  // TODO: Probably show something if we couldn't find a specification
  return specification ? (
    <SpecificationInformation specification={specification} />
  ) : null;
});
