import jss from 'jss';
import * as jssGlobal from 'jss-global';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import 'typeface-roboto';
import 'typeface-roboto-mono';

import { Page } from 'view/Page';
import { ThemeProvider } from 'view/ThemeProvider';

jss
  .use(jssGlobal.default())
  .createStyleSheet({
    // TODO: Cast this to any since the @types/jss seemed to not like this type for some reason
    '@global': {
      body: {
        margin: 0,
      },
    } as any,
  })
  .attach();
ReactDOM.render(
  <ThemeProvider>
    <BrowserRouter>
      <Page />
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root'),
);
