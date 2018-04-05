import React from 'react';
import { observable } from 'mobx';
import { PaletteType } from 'material-ui';
class SettingsState {
  @observable public paletteType: PaletteType = 'light';
}
export const state: SettingsState = new SettingsState();
