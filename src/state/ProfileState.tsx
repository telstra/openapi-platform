import { Profile } from 'model/Profile';
import { observable } from 'mobx';
export interface ProfileState {
  me: Profile;
}
class BasicProfileState {
  @observable
  public me: Profile = {
    id: 1, // dummy id
    name: 'Name'
  };
}
export const state: ProfileState = new BasicProfileState();
