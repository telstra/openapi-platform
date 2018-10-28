import { createMount } from '@material-ui/core/test-utils';
import initStoryshots from '@storybook/addon-storyshots';
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
import { join } from 'path';
import { readConfig, apiBaseUrl } from '@openapi-platform/config';
jest.mock('@openapi-platform/config');
const config = readConfig();
global.API_BASE_URL = apiBaseUrl(config);
// Required because Storybook uses require.context but this file is not run through Webpack
registerRequireContextHook();

initStoryshots({
  configPath: join(__dirname, '../../.storybook'),
  /*
    If you remove this, you end up some rather confusing errors.
    See: https://material-ui.com/guides/testing/ and https://github.com/mui-org/material-ui/issues/9243
  */
  renderer: createMount,
});
