#!/usr/bin/env node
require('source-map-support/register');

const { openapiLogger } = require('@openapi-platform/logger');

const { build } = require('../lib/index');

const logger = openapiLogger();

// TODO: path needs to be configurable via arguments
build()
  .then(() => {
    logger.info('Webpack configuration complete');
  })
  .catch(() => {
    logger.error('An error occurred when configuring webpack compiler...');
    logger.error(error);
  });
