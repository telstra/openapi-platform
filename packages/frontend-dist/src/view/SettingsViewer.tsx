import {
  FormControl,
  FormLabel,
  FormControlLabel,
  FormGroup,
  Switch,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import { observer } from 'mobx-react';
import React, { ComponentType } from 'react';

import { state } from '../state/SettingsState';
import { ContentContainer } from './basic/ContentContainer';
import { SimpleToolbar } from './basic/SimpleToolbar';
import { createStyled } from './createStyled';

const Styled = createStyled(theme => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: theme.spacing.unit * 2,
    boxSizing: 'border-box',
  },
}));
const darkThemeLabel = 'Dark';
const sidebarBackgrounds = [
  {
    background:
      'linear-gradient(-225deg, #3023AE 0%, #4084B9 47%, #6DC8D7 87%, #59C9C1 100%)',
    contrastText: 'white',
    contrastIcon: 'white',
    label: 'Ocean Breeze',
  },
  {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    contrastText: 'white',
    contrastIcon: 'white',
    label: 'Summet Sunset',
  },
  {
    background: 'linear-gradient(to top, #09203F 0%, #537895 100%)',
    contrastText: 'white',
    contrastIcon: 'white',
    label: 'Midnight',
  },
  {
    background: 'linear-gradient(to top, #E6E9F0 0%, #EEF1F5 100%)',
    contrastText: 'rgba(0, 0, 0, 0.63)',
    contrastIcon: 'rgba(100, 135, 185, 0.87)',
    label: 'Snowfall',
  },
];
const onSearch = event => {};
const toggleDarkTheme = (e, checked) => {
  state.paletteType = checked ? 'dark' : 'light';
};
const setSidebarBackground = (e, value) => {
  state.navBackground = sidebarBackgrounds[value].background;
  state.navContrastIcon = sidebarBackgrounds[value].contrastIcon;
  state.navContrastText = sidebarBackgrounds[value].contrastText;
};

// TODO: Add react-router's injected props
export const SettingsViewer: ComponentType<{}> = observer(() => (
  <Styled>
    {({ classes }) => [
      <SimpleToolbar
        key={0}
        title="Settings"
        searchPrompt="Filter settings"
        onSearchInputChange={onSearch}
        actions={[]}
      />,
      <ContentContainer key={1}>
        <Paper className={classes.paper}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Theme</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={state.paletteType === 'dark'}
                    onChange={toggleDarkTheme}
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
              onChange={setSidebarBackground}
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
      </ContentContainer>,
    ]}
  </Styled>
));
