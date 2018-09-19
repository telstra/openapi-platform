import { configure } from '@storybook/react';
import { createStories } from './createStories';
import { withKnobs } from '@storybook/addon-knobs';
import { checkA11y } from '@storybook/addon-a11y';
import { setOptions } from '@storybook/addon-options';
import withBackgrounds from '@storybook/addon-backgrounds';
import { addDecorator } from '@storybook/react';

addDecorator(withKnobs);
addDecorator(checkA11y);
addDecorator(withBackgrounds());
setOptions({
  name: 'OpenAPI Platform',
});
configure(() => {
  const tsxModuleContext = require.context(
    '../packages/frontend-dist/src/view',
    true,
    /\.tsx$/,
  );
  const moduleInfo = tsxModuleContext
    .keys()
    .map(path => ({ path, requiredModule: tsxModuleContext(path) }));
  createStories(moduleInfo);
}, module);
