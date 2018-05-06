import React, { ComponentType } from 'react';
import { observer } from 'mobx-react';
import { FormControl, FormLabel, FormControlLabel, FormGroup, Switch } from 'material-ui';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Paper from 'material-ui/Paper';
import { SimpleToolbar } from 'basic/SimpleToolbar';

import { ContentContainer } from 'basic/ContentContainer';
import { state } from 'state/SettingsState';
import { createStyled } from 'view/createStyled';

const Styled = createStyled(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing.unit * 2,
    boxSizing: 'border-box'
  }
}));
const darkThemeLabel = 'Dark';
const sidebarBackgrounds = [
  {
    background:
      'linear-gradient(-225deg, #3023AE 0%, #4084B9 47%, #6DC8D7 87%, #59C9C1 100%)',
    contrastText: 'white',
    contrastIcon: 'white',
    label: 'Ocean Breeze'
  },
  {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    contrastText: 'white',
    contrastIcon: 'white',
    label: 'Summet Sunset'
  },
  {
    background: 'linear-gradient(to top, #09203F 0%, #537895 100%)',
    contrastText: 'white',
    contrastIcon: 'white',
    label: 'Midnight'
  },
  {
    background: 'linear-gradient(to top, #E6E9F0 0%, #EEF1F5 100%)',
    contrastText: 'rgba(0, 0, 0, 0.63)',
    contrastIcon: 'rgba(100, 135, 185, 0.87)',
    label: 'Snowfall'
  }
];

// TODO: Add react-router's injected props
export const SettingsViewer: ComponentType<{}> = observer(() => (
  <Styled>
    {({ classes }) => [
      <SimpleToolbar
        title="Settings"
        searchPrompt="Filter settings"
        onSearchInputChange={(input: string) => {
          console.log(input);
        }}
        actions={[]}
      />,
      <ContentContainer>
        <Paper className={classes.paper}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Theme</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.paletteType === 'dark'}
                    onChange={e =>
                      (state.paletteType = e.target.checked ? 'dark' : 'light')
                    }
                    value={darkThemeLabel}
                  />
                }
                label={darkThemeLabel}
              />
            </FormGroup>
            <FormLabel component="legend">Sidebar</FormLabel>
            <RadioGroup
              name="sidebar"
              value={sidebarBackgrounds
                .findIndex(s => s.background === state.navBackground)
                .toString()}
              onChange={e => {
                let style = (e.target as any).value;
                state.navBackground = sidebarBackgrounds[style].background;
                state.navContrastIcon = sidebarBackgrounds[style].contrastIcon;
                state.navContrastText = sidebarBackgrounds[style].contrastText;
              }}
            >
              {sidebarBackgrounds.map((background, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={background.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
      </ContentContainer>
    ]}
  </Styled>
));
