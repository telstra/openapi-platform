import { createMount } from '@material-ui/core/test-utils';
import initStoryshots from '@storybook/addon-storyshots';
import registerRequireContextHook from 'babel-plugin-require-context-hook/register';
registerRequireContextHook();
initStoryshots({
  renderer: createMount,
});
