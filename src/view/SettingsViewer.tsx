import React, { ComponentType } from 'react';
import { observer } from 'mobx-react';
import { FormControl, FormLabel, FormControlLabel, FormGroup, Switch } from 'material-ui';
import { ContentContainer } from 'basic/ContentContainer';
import { state } from 'state/SettingsState';
import { createStyled } from 'view/createStyled';
const Styled = createStyled(theme => ({}));
const darkThemeLabel = 'Dark theme';
// TODO: Add react-router's injected props
export const SettingsViewer: ComponentType<{}> = observer(() => (
  <Styled>
    {({ classes }) => (
      <ContentContainer>
        <FormControl component="fieldset">
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
        </FormControl>
      </ContentContainer>
    )}
  </Styled>
));
