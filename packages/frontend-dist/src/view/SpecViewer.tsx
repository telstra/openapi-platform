import { observer } from 'mobx-react';
import React, { SFC } from 'react';
import { RouteComponentProps } from 'react-router';

import { state } from '../state/SpecState';
import { NotFound } from './basic/NotFound';
import { SpecInformation } from './basic/SpecInformation';

export const SpecViewer: SFC<RouteComponentProps<{}>> = observer(({ match }) => {
  const spec = state.specs.get(Number.parseInt(match.params.id, 10));
  return spec ? <SpecInformation spec={spec} /> : <NotFound item="specification" />;
});
