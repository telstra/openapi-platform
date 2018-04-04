import React, { SFC } from 'react';
import { observer } from 'mobx-react';
import { state } from 'state/ProfileState';
import { ProfileInformation } from 'src/view/basic/ProfileInformation';
// TODO: Add react-router's injected props
export const ProfileViewer: SFC<any> = observer(({ matches }) => (
  <ProfileInformation profile={state.me} /> // Using state.me for now as example data
));
