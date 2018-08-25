#!/usr/bin/env node
const { join } = require('path');
const { build } = require('../lib/index');
build({
  OUTPUT_PATH: process.cwd(),
  STATS_DIRNAME: null,
});
