import React, { ComponentType } from 'react';
import { withStyles } from 'material-ui';
import { state } from 'state/SettingsState';
import { observer } from 'mobx-react';
const styles = theme => ({
  content: {
    padding: theme.spacing.unit * 2
  }
});
export const ContentContainer: ComponentType<{}> = withStyles(styles, {
  withTheme: true
})(({ classes, children }) => <div className={classes.content}>{children}</div>);
