import React, { SFC } from 'react';
import { NavigationMenu } from 'basic/NavigationMenu';
import { Overview } from 'view/Overview';
import { Route } from 'react-router-dom';
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
