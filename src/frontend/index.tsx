import React from 'react';
import ReactDOM from 'react-dom';
import { Page } from 'view/Page';
import { BrowserRouter } from 'react-router-dom';
ReactDOM.render(
  <BrowserRouter>
    <Page />
  </BrowserRouter>,
  document.getElementById('root')
);
