import React from 'react';
import { observable } from 'mobx';
import { PaletteType } from 'material-ui';
class SettingsState {
  @observable public paletteType: PaletteType = 'light';
  @observable
  public navBackground: string = 'linear-gradient(-225deg, #3023AE 0%, #4084B9 47%, #6DC8D7 87%, #59C9C1 100%)';
  @observable public navContrastIcon: string = 'white';
  @observable public navContrastText: string = 'white';
}
export const state: SettingsState = new SettingsState();
