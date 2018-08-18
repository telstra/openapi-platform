import { observer } from 'mobx-react';
import React, { SFC } from 'react';

import { state } from '../state/SpecState';
import { SpecInformation } from './basic/SpecInformation';

// TODO: Fix the prop types for this
export const SpecViewer: SFC<any> = observer(({ match }) => {
  const spec = state.specs.get(match.id);
  // TODO: Probably show something if we couldn't find a Spec
  return spec ? <SpecInformation spec={spec} /> : null;
});
