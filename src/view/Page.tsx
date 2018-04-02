import React, { SFC } from 'react';
import { NavigationMenu } from 'basic/NavigationMenu';
import { Overview } from 'view/Overview';
import { Route } from 'react-router-dom';
/**
 * The Swagger Platform page
 */
export const Page: SFC = () => (
  <div>
    <nav>
      <NavigationMenu />
    </nav>
    <main>
      <Route path="/" component={Overview} />
    </main>
  </div>
);
