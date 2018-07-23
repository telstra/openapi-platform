# swagger-platform Developer Readme

## Prerequisites
Building and running swagger-platform requires the following to be installed on
your machine:
 * Node.js
 * Yarn

## Running Locally
The following commands can be used to run swagger-platform locally for
development:
 * `yarn run watch:frontend` \
   Runs `webpack-dev-server` on the frontend code, allowing the frontend to be
   accessed from a web browser. All generated source code is built in
   development mode, enabling source maps and disabling minification. The
   frontend will be automatically recompiled when changes are detected,
   immediately made available to web browsers by `webpack-dev-server`.
 * `yarn run watch:backend` \
   Builds and runs the backend code in development mode. The backend will be
   automatically recompiled and restarted when changes are detected.
 * `yarn run watch:checker` \
   Runs the linter and TypeScript type checker on the entire codebase, watching
   for any changes made to the code. When changes are detected, the linter and
   TypeScript type checker are automatically rerun.

## Building and Deploying
 * `yarn run build:clean` \
   Cleans the `build` directory, removing it and its contents.
 * `yarn run build:prod` \
   Builds both the backend and frontend in production mode, enabling
   minification and disabling source maps. Generated build artefacts are placed
   in the `build` directory.
 * `yarn run build:dev` \
   Builds both the backend and frontend in production mode, enabling source
   maps and disabling minification. Generated build artefacts are placed in the
   `build` directory.
 * `yarn run build:webpack` \
   Helper command to run `webpack` while displaying progress messages. Not
   intended for direct use.
 * `yarn run build` \
   Runs the `clean` and `build:dev` commands in succession.
 * `yarn run deploy:backend` \
   Runs the backend server. This requires that the backend first be built using
   one of the above commands.

## Testing
 * `yarn run test`
   Runs all Jest tests in the `test` directory, displaying a summary of the
   test results.
 * `yarn run ci-test`
   Runs the `checker:types` and `test` commands in succession, to both run the
   TypeScript type checker and Jest tests. Intended for use with continuous
   integration, rather than to be run directly.

## Other Commands
 * `yarn run checker:types` \
   Runs the TypeScript type checker on the codebase, displaying the output.
   This will display any serious errors in the code, such as invalid syntax or
   the use of incorrect types.
 * `yarn run checker:lint` \
   Runs the linter on the codebase, displaying the output. This will display
   any linter warnings or errors, as configured for the project.
 * `yarn run checker` \
   Runs the linter and TypeScript type checker on the codebase, displaying the
   output. This is the same as running the `checker:types` and `checker:lint`
   commands in succession. Use the `watch:checker` command to automatically
   rerun this command when changes are made.
 * `yarn run format` \
   Reformats all JavaScript and TypeScript code in the project, using Prettier.
   **Note that this action will overwrite files without creating a backup.**

## Storybook
Basic UI components (components with nearly or entirely UI related logic) can be added to Storybook.

Storybook allows developers to see the visual appearance of various components.
We also use Storybook examples for snapshot testing.

### How to add a component to storybook
You will want to export a variable named `storybook` in the same file as the component you want to add to Storybook. 

E.g.
```tsx
import { SFC }, React from 'react';
interface MyComponentProps {
  message: string;
}
const MyComponent: SFC<MyComponentProps> = ({ message }) => <div>{ message }</div>;

export const storybook: Category<MyComponentProps> = {
  Component: MyComponent,
  stories: {
    TheTitleOfTheStory: {
      message: 'This field represents props.message'
    }
  },
};
```


See the `Category` type for information on the fields available in the `storybook` variable.
