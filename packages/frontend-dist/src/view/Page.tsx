import React, { ComponentType } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { AddSdkConfigModal } from './AddSdkConfigModal';
import { AddSpecModal } from './AddSpecModal';
import { NotFound } from './basic/NotFound';
import { createStyled } from './createStyled';
import { DeleteSpecModal } from './DeleteSpecModal';
import { NavigationMenu } from './NavigationMenu';
import { Overview } from './Overview';
import { ProfileViewer } from './ProfileViewer';
import { SettingsViewer } from './SettingsViewer';
import { SpecViewer } from './SpecViewer';

const Styled = createStyled(theme => ({
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: theme.palette.background.default,
  },
  sideBar: {
    position: 'sticky',
    top: 0,
  },
  content: {
    flexBasis: '600px',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
}));

const redirect = () => <Redirect to={{ pathname: '/overview' }} />;

/**
 * The Swagger Platform page
 */
export const Page: ComponentType<{}> = () => (
  <Styled>
    {({ classes }) => (
      <div className={classes.page}>
        <aside>
          <nav className={classes.sideBar}>
            <Route component={NavigationMenu} />
          </nav>
        </aside>
        <main className={classes.content}>
          <Switch>
            <Route exact path="/" render={redirect} />
            <Route path="/overview" component={Overview} />
            <Route path="/specs/:id" component={SpecViewer} />
            <Route path="/profiles/:id" component={ProfileViewer} />
            <Route path="/settings" component={SettingsViewer} />
            <Route component={NotFound} />
          </Switch>
          <Route exact path="/specs/:specId/edit" component={AddSpecModal} />
          <Route exact path="/specs/:specId/delete" component={DeleteSpecModal} />
          <Route
            exact
            path="/specs/:specId/sdk-configs/add"
            component={AddSdkConfigModal}
          />
          <Route
            exact
            path="/specs/:specId/sdk-configs/:sdkConfigId/edit"
            component={AddSdkConfigModal}
          />
        </main>
      </div>
    )}
  </Styled>
);
