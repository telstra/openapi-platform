#!/usr/bin/env node
require('source-map-support/register');

const { build } = require('../lib/index');
const logger = require('../lib/logger');

// TODO: path needs to be configurable via arguments
build()
  .then(() => {
    logger.info('Webpack configuration complete');
  })
  .catch(() => {
    logger.error('An error occurred when configuring webpack compiler...');
    logger.error(error);
  });
