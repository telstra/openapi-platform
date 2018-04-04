import React, { SFC } from 'react';
import { Profile } from 'model/Profile';
export interface ProfileInformationProps {
  readonly profile: Profile;
}
export const ProfileInformation: SFC<ProfileInformationProps> = ({ profile }) => (
  <div>{profile.name}</div>
);
