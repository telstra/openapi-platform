import React from 'react';
import ReactDOM from 'react-dom';
import { Page } from 'view/Page';
import { BrowserRouter } from 'react-router-dom';
import jss from 'jss';
import * as jssGlobal from 'jss-global';
import 'typeface-roboto';
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
  <BrowserRouter>
    <Page />
  </BrowserRouter>,
  document.getElementById('root')
);
