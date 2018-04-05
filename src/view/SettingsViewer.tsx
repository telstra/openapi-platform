import React, { ComponentType } from 'react';
import { observer } from 'mobx-react';
import { Switch, withStyles } from 'material-ui';
import { ContentContainer } from 'basic/ContentContainer';
const styles = theme => ({});
// TODO: Add react-router's injected props
export const SettingsViewer: ComponentType<{}> = withStyles(styles, { withTheme: true })(
  observer(() => <ContentContainer>Some settings should go here</ContentContainer>)
);
