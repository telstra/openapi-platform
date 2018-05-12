import * as Icons from '@material-ui/icons';
import classNames from 'classnames';
import { List, ListItem, ListItemIcon, ListItemText } from 'material-ui';
import Divider from 'material-ui/Divider';
import Drawer from 'material-ui/Drawer';
import { observable, action, computed } from 'mobx';
import { Observer } from 'mobx-react';
import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router';

import { state as profileState } from 'state/ProfileState';
import { createStyled } from 'view/createStyled';

// TODO: Maybe come back to this and see if we can get proper type validation going
const Styled: any = createStyled(theme => ({
  navPaper: {
    overflowX: 'hidden',
    position: 'relative',
  },
  navPaperClosed: {
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  navPaperOpen: {
    width: theme.spacing.unit * 24,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  primaryButton: {
    marginBottom: theme.spacing.unit,
  },
  navIcon: theme.nav.icon,
  navText: theme.nav.text,
}));

const NavigationButton = ({ icon, primary, classes, ...other }) => (
  <ListItem button {...other}>
    <ListItemIcon>{icon}</ListItemIcon>
    <ListItemText primary={primary} classes={{ primary: classes.navText }} />
  </ListItem>
);

export class NavigationMenu extends Component<RouteComponentProps<{}>, {}> {
  @observable private open: boolean = false;
  @computed
  get actionName(): string {
    return this.open ? 'Close' : 'Open';
  }
  @action
  private toggleOpen = (): void => {
    this.open = !this.open;
  };

  private goToOverview = () => this.props.history.push('/overview');
  private goToProfile = () => this.props.history.push(`/profiles/${profileState.me.id}`);
  private goToSettings = () => this.props.history.push('/settings');

  public render() {
    return (
      <Styled>
        {({ classes }) => (
          <Observer>
            {() => (
              <Drawer
                variant="permanent"
                classes={{
                  paper: classNames(
                    classes.navPaper,
                    this.open ? classes.navPaperOpen : classes.navPaperClosed,
                  ),
                }}
                open={this.open}
              >
                <List component="nav">
                  <NavigationButton
                    onClick={this.toggleOpen}
                    icon={
                      this.open ? (
                        <Icons.ChevronLeft className={classes.navIcon} />
                      ) : (
                        <Icons.ChevronRight className={classes.navIcon} />
                      )
                    }
                    primary={this.actionName}
                    classes={classes}
                    className={classes.primaryButton}
                  />
                  <Divider />
                  <NavigationButton
                    onClick={this.goToOverview}
                    icon={<Icons.Dashboard className={classes.navIcon} />}
                    primary="Overview"
                    classes={classes}
                  />
                  <NavigationButton
                    onClick={this.goToProfile}
                    icon={<Icons.AccountCircle className={classes.navIcon} />}
                    primary="Account"
                    classes={classes}
                  />
                  <NavigationButton
                    onClick={this.goToSettings}
                    icon={<Icons.Settings className={classes.navIcon} />}
                    primary="Settings"
                    classes={classes}
                  />
                </List>
              </Drawer>
            )}
          </Observer>
        )}
      </Styled>
    );
  }
}
