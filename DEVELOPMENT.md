# openapi-platform Developer Readme

## Prerequisites
Building and running openapi-platform requires the following to be installed on
your machine:
 * Node.js
 * Yarn

## Quick start guide
1. `git clone` the repository
1. `yarn install` at the root of the project
1. Add a configuration file to the root directory of the project
1. `yarn watch`
1. Have at it :)

## Gulp Commands
Most commands/tasks are managed by [Gulp](https://github.com/gulpjs/gulp). If
you want a list of tasks you can run with Gulp with descriptions of what they
do, then run: `yarn gulp --tasks --depth 1`.

If you want to run a Gulp task, then run: `yarn gulp <task>`. Some of them have
also been added to the package.json file for ease of use (e.g. rather than
running `yarn gulp transpile`, you can just run `yarn transpile`).

## Running Locally
The following commands can be used to run openapi-platform locally for
development:
 * `yarn watch` \
   Watches for any changes in the src folder of each package. If a change is
   detected then the code will be transpiled, before rebundling the frontend,
   restarting the backend, and reloading the frontend in the browser.

 * `yarn watch:build` \
   Watches for any changes in the src folder of each package. If a change is
   detected then the code will be transpiled, with the frontend package also
   being rebundled. This must be run if you plan on using `watch:frontend` or
   `watch:backend`.

 * `yarn watch:frontend` \
   Serves the frontend app, but automatically reloads the app in the browser
   whenever the frontend bundle changes. Note that in order to automatically
   rebundle the frontend, you will need to run `watch:build` in parallel.

 * `yarn watch:backend` \
   Runs the backend server, restarting it whenever the transpiled sources for
   any package change. Note that in order to automatically retranspile sources,
   you will need to run `watch:build` in parallel.

 * `yarn watch:checker` \
   Runs the linter and TypeScript type checker on the entire codebase, watching
   for any changes made to the code. When changes are detected, the linter and
   TypeScript type checker are automatically rerun.

## Building and Deploying
 * `yarn build` \
   Runs transpilation and bundling scripts to rebuild all packages. Runs in
   `development` mode by default. To build for production, either set the `env`
   option in your configuration file or the `NODE_ENV` environment variable to
   `production`.

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
