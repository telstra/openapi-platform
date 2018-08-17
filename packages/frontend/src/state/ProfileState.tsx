import { observable } from 'mobx';
import { HasId, Profile } from '@openapi-platform/model';

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
