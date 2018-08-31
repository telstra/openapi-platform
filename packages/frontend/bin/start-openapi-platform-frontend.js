#!/usr/bin/env node
require('source-map-support/register');

const { join } = require('path');
const { build } = require('../lib/index');

const express = require('express');

const { openapiLogger } = require('@openapi-platform/logger');
const { readConfig } = require('@openapi-platform/config');

const logger = openapiLogger();

// TODO: Webpack output
build({
  OUTPUT_PATH: __dirname,
})
  .then(() => {
    const config = readConfig();
    /* 
      Note that if people want to customize this 
      they can just use build-openapi-platform-frontend
    */
    const app = express();

    // TODO: If the bundle output changes, this will break. Needs to be refactored.
    app.use('/', express.static(join(__dirname, 'dist')));

    const port = config.get('ui.port');
    app.listen(port, () => {
      logger.info(`Serving frontend on port ${port}`);
    });
  })
  .catch(err => {
    // TODO: Could probably be more descriptive
    logger.error('Something went wrong...');
    logger.error(err);
  });
