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
 * `yarn run build:webpack` \
   Helper command to run `webpack` while displaying progress messages. Not
   intended for direct use.
 * `yarn run build:prod` \
   Builds both the backend and frontend in production mode, enabling
   minification and disabling source maps. Generated build artefacts are placed
   in the `build` directory.
 * `yarn run build:dev` \
   Builds both the backend and frontend in production mode, enabling source
   maps and disabling minification. Generated build artefacts are placed in the
   `build` directory.
 * `yarn run build` \
   Runs the `clean` and `build:dev` commands in sequence.
 * `yarn run deploy:backend` \
   Runs the backend server. This requires that the backend first be built using
   one of the above commands.

## Other Commands
