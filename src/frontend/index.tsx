import React from 'react';
import ReactDOM from 'react-dom';
import { Page } from 'view/Page';
import { BrowserRouter } from 'react-router-dom';
import jss from 'jss';
import 'typeface-roboto';
import 'typeface-roboto-mono';
import { ThemeProvider } from 'view/ThemeProvider';
import * as jssGlobal from 'jss-global';

jss
  .use(jssGlobal.default())
  .createStyleSheet({
    // TODO: Cast this to any since the @types/jss seemed to not like this type for some reason
    '@global': {
      body: {
        margin: 0
      }
    } as any
  })
  .attach();
ReactDOM.render(
  <ThemeProvider>
    <BrowserRouter>
      <Page />
    </BrowserRouter>
  </ThemeProvider>,
  document.getElementById('root')
);
