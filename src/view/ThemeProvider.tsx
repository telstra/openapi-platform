import React, { SFC } from 'react';
import { createMuiTheme, MuiThemeProvider } from 'material-ui';
import { observer } from 'mobx-react';

import { state } from 'state/SettingsState';

export const ThemeProvider: SFC<{}> = observer(({ children }) => (
  <MuiThemeProvider
    theme={createMuiTheme({
      palette: {
        type: state.paletteType
      },
      overrides: {
        MuiDrawer: {
          paper: {
            background: state.navBackground
          }
        }
      },
      nav: {
        icon: {
          color: state.navContrastIcon
        },
        text: {
          color: state.navContrastText
        }
      }
    } as any)}
  >
    {children}
  </MuiThemeProvider>
));
