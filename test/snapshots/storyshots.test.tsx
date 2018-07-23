import { createMount } from '@material-ui/core/test-utils';
import initStoryshots from '@storybook/addon-storyshots';
// Required because Storybook uses require.context but this file is not run through Webpack
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
registerRequireContextHook();
initStoryshots({
  renderer: createMount,
});
