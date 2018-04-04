import React, { SFC } from 'react';
import { observer } from 'mobx-react';
import { state } from 'state/ProfileState';
import { ProfileInformation } from 'src/view/basic/ProfileInformation';
export const ProfileViewer = ({ matches }) => (
  <ProfileInformation profile={state.me} /> // Using state.me for now as example data
);
