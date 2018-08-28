# openapi-platform Developer Readme

## Prerequisites
Building and running openapi-platform requires the following to be installed on
your machine:
 * Node.js
 * Yarn

## Running Locally
The following commands can be used to run openapi-platform locally for
development:
 * `yarn watch` \
   Watches for any changes in the src folders of all packages.
   If a change is detected the code is transpiled, the frontend package is rebundled and
   the frontend & backend services are restarted.
 * `yarn watch:checker` \
   Runs the linter and TypeScript type checker on the entire codebase, watching
   for any changes made to the code. When changes are detected, the linter and
   TypeScript type checker are automatically rerun.

## Building and Deploying
 * `yarn build` \
   Runs transpilation and bundling scripts to rebuild all packages.
   Runs in `development` mode by default. To build for production use `NODE_ENV=production yarn build`.

## Testing
 * `yarn test`
   Runs all Jest tests in the `test` directory, displaying a summary of the
   test results.
 * `yarn ci-test`
   Runs the `checker:types` and `test` commands in succession, to both run the
   TypeScript type checker and Jest tests. Intended for use with continuous
   integration, rather than to be run directly.

### Snapshots
If you want to update Jest snapshots run `yarn test snapshots -u`.

## Other Commands
 * `yarn checker:types` \
   Runs the TypeScript type checker on the codebase, displaying the output.
   This will display any serious errors in the code, such as invalid syntax or
   the use of incorrect types.
 * `yarn checker:lint` \
   Runs the linter on the codebase, displaying the output. This will display
   any linter warnings or errors, as configured for the project.
 * `yarn checker` \
   Runs the linter and TypeScript type checker on the codebase, displaying the
   output. This is the same as running the `checker:types` and `checker:lint`
   commands in succession. Use the `watch:checker` command to automatically
   rerun this command when changes are made.
 * `yarn format` \
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
