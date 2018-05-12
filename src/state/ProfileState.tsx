import { observable } from 'mobx';

import { Profile } from 'model/Profile';

export interface ProfileState {
  me: Profile;
}

class BasicProfileState {
  @observable
  public me: Profile = {
    id: 1, // dummy id
    name: 'Name',
  };
}

export const state: ProfileState = new BasicProfileState();
