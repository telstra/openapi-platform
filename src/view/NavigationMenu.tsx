import React, { SFC } from 'react';
import Drawer from 'material-ui/Drawer';
import * as Icons from '@material-ui/icons';
import { List, ListItem, ListItemIcon, ListItemText } from 'material-ui';
import { state as profileState } from 'state/ProfileState';
import { Route } from 'react-router-dom';
import { observable, action, autorun, computed } from 'mobx';
import { observer, Observer } from 'mobx-react';
import { createStyled } from 'view/createStyled';
import Divider from 'material-ui/Divider';
import classNames from 'classnames';
// TODO: Maybe come back to this and see if we can get proper type validation going
const Styled: any = createStyled(theme => ({
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
  },
  primaryButton: {
    marginBottom: theme.spacing.unit
  },
  navIcon: theme.nav.icon,
  navText: theme.nav.text
}));

export interface NavigationMenuProps {}

// TODO: In this case, it would probably be better if we didn't use the same state for all NavigationMenu components
class NavigationState {
  @observable public open: boolean = false;
  @computed
  public get actionName(): string {
    return this.open ? 'Close' : 'Open';
  }
  @action
  public toggleOpen(): void {
    this.open = !this.open;
  }
}
const navState = new NavigationState();
const NavigationButton = ({ icon, primary, classes, ...other }) => (
  <ListItem button {...other}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={primary} classes={{ primary: classes.navText }} />
  </ListItem>
);
export const NavigationMenu: SFC<NavigationMenuProps> = () => (
  <Styled>
    {({ classes }) => (
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
                  <NavigationButton
                    onClick={() => navState.toggleOpen()}
                    icon={
                      navState.open ? (
                        <Icons.ChevronLeft className={classes.navIcon} />
                      ) : (
                        <Icons.ChevronRight className={classes.navIcon} />
                      )
                    }
                    primary={navState.actionName}
                    classes={classes}
                    className={classes.primaryButton}
                  />
                  <Divider />
                  <NavigationButton
                    onClick={() => history.push('/overvie')}
                    icon={<Icons.Dashboard className={classes.navIcon} />}
                    primary="Overview"
                    classes={classes}
                  />
                  <NavigationButton
                    onClick={() => history.push(`/profiles/${profileState.me.id}`)}
                    icon={<Icons.AccountCircle className={classes.navIcon} />}
                    primary="Account"
                    classes={classes}
                  />
                  <NavigationButton
                    onClick={() => history.push('/settings')}
                    icon={<Icons.Settings className={classes.navIcon} />}
                    primary="Settings"
                    classes={classes}
                  />
                </List>
              </Drawer>
            )}
          </Observer>
        )}
      />
    )}
  </Styled>
);
