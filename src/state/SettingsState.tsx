import React from 'react';
import { observable } from 'mobx';
class SettingsState {
  @observable public dark: boolean = false;
}
export const state: SettingsState = new SettingsState();
