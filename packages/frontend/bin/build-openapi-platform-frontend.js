#!/usr/bin/env node
require('source-map-support/register');

const logger = require('../lib/logger');
const { build } = require('../lib/index');

build()
  .then(() => {
    logger.info('Webpack configuration complete');
  })
  .catch(() => {
    logger.error('An error occurred when configuring webpack compiler...');
    logger.error(error);
  });
