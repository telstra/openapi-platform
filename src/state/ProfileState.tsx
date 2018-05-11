import { Profile } from 'model/Profile';
import { HasId } from 'model/Entity';
import { observable } from 'mobx';
export interface ProfileState {
  me: HasId<Profile>;
}
class BasicProfileState {
  @observable
  public me: HasId<Profile> = {
    id: 1, // dummy id
    name: 'Name'
  };
}
export const state: ProfileState = new BasicProfileState();
