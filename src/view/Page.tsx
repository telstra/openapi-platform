import React, { ComponentType } from 'react';
import { SpecificationViewer } from 'view/SpecificationViewer';
import { Overview } from 'view/Overview';
import { Route, Switch } from 'react-router-dom';
import { ProfileViewer } from 'view/ProfileViewer';
import { createStyled } from 'view/createStyled';
import { NavigationMenu } from 'view/NavigationMenu';
import { SettingsViewer } from 'view/SettingsViewer';
import { NotFound } from 'basic/NotFound';
import { observer } from 'mobx-react';
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
    flexShrink: 1
  }
}));

/**
 * The Swagger Platform page
 */
export const Page: ComponentType<{}> = () => (
  <Styled>
    {({ classes }) => (
      <div className={classes.page}>
        <aside className={classes.sideBar}>
          <nav>
            <NavigationMenu />
          </nav>
        </aside>
        <main className={classes.content}>
          <Switch>
            <Route exact path="/" component={Overview} />
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
