import { observer } from 'mobx-react';
import React, { SFC } from 'react';
import { RouteComponentProps } from 'react-router';

import { state as sdkConfigState } from '../state/SdkConfigState';
import { state as specState } from '../state/SpecState';
import { NotFound } from './basic/NotFound';
import { SpecInformation } from './basic/SpecInformation';

export const SpecViewer: SFC<RouteComponentProps<{}>> = observer(({ match }) => {
  const specId = Number.parseInt(match.params.id, 10);
  const spec = specState.specs.get(specId);
  const sdkConfigs = sdkConfigState.specSdkConfigs.get(specId);
  return spec && sdkConfigs ? (
    <SpecInformation spec={spec} sdkConfigs={sdkConfigs} />
  ) : (
    <NotFound item="specification" />
  );
});
