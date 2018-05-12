import React, { ComponentType } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { NotFound } from 'basic/NotFound';
import { createStyled } from 'view/createStyled';
import { NavigationMenu } from 'view/NavigationMenu';
import { Overview } from 'view/Overview';
import { ProfileViewer } from 'view/ProfileViewer';
import { SettingsViewer } from 'view/SettingsViewer';
import { SpecificationViewer } from 'view/SpecificationViewer';

const Styled = createStyled(theme => ({
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: theme.palette.background.default
  },
  sideBar: {
    flexGrow: 0,
    flexShrink: 0
  },
  content: {
    flexBasis: '600px',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0
  }
}));

const redirect = () => <Redirect to={{ pathname: '/overview' }} />;

/**
 * The Swagger Platform page
 */
export const Page: ComponentType<{}> = () => (
  <Styled>
    {({ classes }) => (
      <div className={classes.page}>
        <aside className={classes.sideBar}>
          <nav>
            <Route component={NavigationMenu} />
          </nav>
        </aside>
        <main className={classes.content}>
          <Switch>
            <Route exact path="/" render={redirect} />
            <Route path="/overview" component={Overview} />
            <Route path="/specifications/:id" component={SpecificationViewer} />
            <Route path="/profiles/:id" component={ProfileViewer} />
            <Route path="/settings" component={SettingsViewer} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    )}
  </Styled>
);
