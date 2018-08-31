#!/usr/bin/env node
require('source-map-support/register');

const { openapiLogger } = require('@openapi-platform/logger');

const logger = openapiLogger();
const { build } = require('../lib/index');
// TODO: path needs to be configurable
build()
  .then(() => {
    logger.info('Webpack configuration complete');
  })
  .catch(() => {
    logger.error('An error occurred when configuring webpack compiler...');
    logger.error(error);
  });
