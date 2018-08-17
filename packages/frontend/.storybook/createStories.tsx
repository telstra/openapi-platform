import React from 'react';
import { storiesOf } from '@storybook/react';
import { basename } from 'path';
import { ThemeProvider } from '../src/view/ThemeProvider';
export function createStories(moduleInfo) {
  moduleInfo.forEach(({ path, requiredModule }) => {
    const storybookInfo = requiredModule.storybook;
    if (storybookInfo && storybookInfo.Component && storybookInfo.stories) {
      const stories = storiesOf(
        storybookInfo.name ? storybookInfo.name : basename(path).replace(/\..*$/g, ''),
        module,
      );
      Object.keys(storybookInfo.stories).forEach(storyKey => {
        const props = storybookInfo.stories[storyKey];
        stories.add(storyKey, () => (
          <ThemeProvider>
            <storybookInfo.Component {...props} />
          </ThemeProvider>
        ));
      });
    }
  });
}
