import { observable } from 'mobx';
import { HasId } from 'model/Entity';
import { Profile } from 'model/Profile';

export interface ProfileState {
  me: HasId<Profile>;
}

export class BasicProfileState {
  @observable
  public me: HasId<Profile> = {
    id: 1, // dummy id
    name: 'Name',
  };
}

export const state: ProfileState = new BasicProfileState();
