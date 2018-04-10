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


## Other Commands
