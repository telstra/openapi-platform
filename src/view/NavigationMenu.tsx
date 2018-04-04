import React, { ComponentType } from 'react';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import SettingsIcon from 'material-ui-icons/Settings';
import { withStyles, StyleRules } from 'material-ui/styles';
import { state as profileState } from 'state/ProfileState';
import { Route } from 'react-router-dom';
import { observable, action, autorun, computed } from 'mobx';
import { observer, Observer } from 'mobx-react';
import Divider from 'material-ui/Divider';
import classNames from 'classnames';
// TODO: Maybe come back to this and see if we can get proper type validation going
const styles: any = theme => ({
  navPaper: {
    overflowX: 'hidden',
    position: 'relative'
  },
  navPaperClosed: {
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  navPaperOpen: {
    width: theme.spacing.unit * 24,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  }
});
export interface NavigationMenuProps {}
// TODO: In this case, it would probably be better if we didn't use the same state for all NavigationMenu components
class NavigationState {
  @observable public open: boolean = false;
  @computed
  public get actionName(): string {
    return this.open ? 'Open' : 'Close';
  }
  @action
  public toggleOpen(): void {
    this.open = !this.open;
  }
}
const navState = new NavigationState();
export const NavigationMenu: ComponentType<NavigationMenuProps> = withStyles(styles, {
  withTheme: true
})(({ classes }) => (
  <Route
    render={({ history }) => (
      /* TODO: Unfortunately, render callbacks aren't considered with MobX's observer so we have to use the <Observer> syntax. 
        There might be a better way. */
      <Observer>
        {() => (
          <Drawer
            variant="permanent"
            classes={{
              paper: classNames(
                classes.navPaper,
                navState.open ? classes.navPaperOpen : classes.navPaperClosed
              )
            }}
            open={navState.open}
          >
            <List component="nav">
              <ListItem button onClick={() => navState.toggleOpen()}>
                <ListItemIcon>
                  <ChevronRightIcon />
                </ListItemIcon>
                <ListItemText>{navState.actionName}</ListItemText>
              </ListItem>
              <Divider />
              <ListItem
                button
                onClick={() => history.push(`/profiles/${profileState.me.id}`)}
              >
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </ListItem>
              <ListItem button onClick={() => history.push('/settings')}>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </ListItem>
            </List>
          </Drawer>
        )}
      </Observer>
    )}
  />
));
