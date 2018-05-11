import React, { SFC } from 'react';
import { observer } from 'mobx-react';
import { SpecInformation } from 'basic/SpecInformation';
import { state } from 'state/SpecState';
import { ContentContainer } from 'basic/ContentContainer';
// TODO: Fix the prop types for this
export const SpecViewer: SFC<any> = observer(({ match }) => {
  const specification = state.specifications.get(match.id);
  // TODO: Probably show something if we couldn't find a specification
  return specification ? <SpecInformation specification={specification} /> : null;
});
