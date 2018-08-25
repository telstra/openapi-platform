#!/usr/bin/env node
const { build } = require('../lib/index');
build()
  .then(() => {
    logger.info('Webpack configuration complete');
  })
  .catch(() => {
    logger.error('An error occurred when configuring webpack compiler...');
    logger.error(error);
  });
