import React from 'react';
import ReactDOM from 'react-dom';
import { Page } from 'view/Page';
import { BrowserRouter } from 'react-router-dom';
import jss from 'jss';
import 'typeface-roboto';
import { ThemeProvider } from 'view/ThemeProvider';
import * as jssGlobal from 'jss-global';
jss
  .use(jssGlobal.default())
  .createStyleSheet({
    '@global': {
      body: {
        margin: 0
      }
    }
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
