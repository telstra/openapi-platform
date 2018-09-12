/**
 * Inspiration for this file taken from https://github.com/babel/babel/blob/master/Gulpfile.js
 */
require('source-map-support/register');

require('colors');
const { join, sep, resolve, relative } = require('path');
const spawn = require('cross-spawn');

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const changed = require('gulp-changed');
const filter = require('gulp-filter');
const plumber = require('gulp-plumber');
const gulpTslint = require('gulp-tslint');
const gulpTypescript = require('gulp-typescript');

const tslint = require('tslint');

const tsProject = gulpTypescript.createProject('tsconfig.json');

const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const historyApiFallback = require('connect-history-api-fallback');
const browserSync = require('browser-sync').create();

const through = require('through2');

const packagesDirName = 'packages';
const frontendPackageName = 'frontend';

let backendNode = undefined;

function swapSrcWith(srcPath, newDirName) {
  // Should look like /packages/<package-name>/src/<rest-of-the-path>
  srcPath = relative(__dirname, srcPath);
  const parts = srcPath.split(sep);
  // Swap out src for the new dir name
  parts[2] = newDirName;
  return join(__dirname, ...parts);
}

/**
 * @param srcPath An absolute path
 */
function swapSrcWithLib(srcPath) {
  return swapSrcWith(srcPath, 'lib');
}

function rename(fn) {
  return through.obj(function(file, enc, callback) {
    file.path = fn(file);
    callback(null, file);
  });
}

function globFolderFromPackagesDirName(dirName, folderName) {
  return [
    `./${dirName}/*/${folderName}/**/*.{js,jsx,ts,tsx,html,css}`,
    `!./${dirName}/*/${folderName}/**/__mocks__/*.{js,ts,tsx,jsx,html,css}`,
  ];
}

function globSrcFromPackagesDirName(dirName) {
  return globFolderFromPackagesDirName(dirName, 'src');
}

function compilationLogger() {
  return through.obj(function(file, enc, callback) {
    console.log(`Compiling '${file.relative.cyan}'`);
    callback(null, file);
  });
}

function errorLogger() {
  return plumber({
    errorHandler(err) {
      console.error(err.stack);
    },
  });
}

const packagesDir = join(__dirname, packagesDirName);
function packagesSrcStream() {
  return gulp.src(globSrcFromPackagesDirName(packagesDirName), { base: packagesDir });
}

function runLinter({ fix }) {
  const stream = packagesSrcStream();
  const tslintProgram = tslint.Linter.createProgram('./tsconfig.json');
  return stream
    .pipe(
      gulpTslint({
        program: tslintProgram,
        fix,
        formatter: 'stylish',
        tslint,
      }),
    )
    .pipe(
      gulpTslint.report({
        summarizeFailureOutput: true,
      }),
    );
}

function reloadBrowser(done) {
  browserSync.reload();
  done();
}

function buildBabel(exclude = []) {
  let stream = packagesSrcStream();

  if (exclude) {
    // We need to exclude things that get bundled
    const filters = exclude.map(p => `!**/${p}/**`);
    filters.unshift('**');
    stream = stream.pipe(filter(filters));
  }

  return stream
    .pipe(errorLogger())
    .pipe(changed(packagesDir, { extension: '.js', transformPath: swapSrcWithLib }))
    .pipe(compilationLogger())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(rename(file => (file.path = swapSrcWithLib(file.path))))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(packagesDir));
}

function createWebpackStream(packageDir) {
  const { readConfig, apiBaseUrl } = require('@openapi-platform/config');
  const openapiPlatformConfig = readConfig();
  const createWebpackConfig = require(join(packageDir, 'webpack.config'));
  const webpackConfig = createWebpackConfig({
    env: openapiPlatformConfig.get('env'),
    apiBaseUrl: apiBaseUrl(openapiPlatformConfig),
  });
  return webpackStream(webpackConfig, webpack);
}

function buildBundle(packageName) {
  const packageDir = join(packagesDir, packageName);
  const stream = gulp.src(packageDir, 'src', 'index.tsx');
  return stream
    .pipe(errorLogger())
    .pipe(createWebpackStream(packageDir))
    .pipe(gulp.dest(join(packageDir, 'dist')));
}

function watchPackages(task, options, folderName = 'src') {
  return gulp.watch(
    globFolderFromPackagesDirName(packagesDirName, folderName),
    { delay: 200, ...options },
    task,
  );
}

function transpile() {
  return buildBabel();
}
transpile.description =
  'Transpiles the sources for each package so that they can be run.';

function bundle() {
  return buildBundle(frontendPackageName);
}
bundle.description = 'Creates bundles for the frontend packages for use in a browser.';

function serveFrontend(done) {
  const { readConfig } = require('@openapi-platform/config');
  const openapiPlatformConfig = readConfig();
  const uiPort = openapiPlatformConfig.get('ui.port');
  browserSync.init({
    port: uiPort,
    server: {
      baseDir: join(__dirname, 'packages/frontend/dist'),
      ws: true,
      // We need this so that routes work properly
      middleware: [historyApiFallback()],
    },
    ui: {
      // Keep in mind that 'uiPort', from the context of OpenAPI Platform, is the frontend web app
      port: uiPort + 1,
    },
  });
  done();
}
serveFrontend.description =
  'Serves the frontend app on the port specified in the OpenAPI Platform config file in the UI ' +
  'section. Note that this is intended for development purposes only, please see the ' +
  'start-openapi-platform-frontend script in the frontend package for a production server.';

function restartServer(done) {
  if (backendNode) {
    backendNode.kill();
  }
  const backendEnv = Object.create(process.env);
  backendEnv.NODE_ENV = 'development';
  backendNode = spawn(
    'node',
    [join(__dirname, 'packages/server/bin/start-openapi-platform-server.js')],
    {
      stdio: 'inherit',
      env: backendEnv,
    },
  );

  backendNode.on('close', function(code) {
    if (code === 8) {
      console.log('Error detected, waiting for changes...'.red);
    }
  });
  done();
}

function watchTranspile() {
  return watchPackages(transpile, { ignoreInitial: false });
}
watchTranspile.description =
  'Same as transpile, but watches for changes in the src directory of each package and retranspiles ' +
  'whenever a change is detected.';

function watchBuild() {
  return watchPackages(build, { ignoreInitial: false });
}
watchBuild.description =
  'Same as build, but watches for changes in the src directory of each package and retranspiles ' +
  'and rebundles whenever a change is detected.';

function watchServer() {
  return watchPackages(restartServer, { ignoreInitial: false }, 'lib');
}
watchServer.description =
  'Runs the backend server, restarting it whenever the transpiled sources for any package ' +
  'change. Note that in order to automatically retranspile sources, you will need to run a ' +
  'command like watch:build.';

function formatLint() {
  return runLinter({ fix: true });
}
formatLint.description =
  'Corrects any automatically fixable linter warnings or errors. Note that this command will ' +
  'overwrite files without creating a backup.';

function checkLint() {
  return runLinter({ fix: false });
}
checkLint.description =
  'Runs the linter on the codebase, displaying the output. This will display any linter warnings ' +
  'or errors, as configured for the project.';

function checkTypes() {
  const stream = packagesSrcStream();
  return stream.pipe(tsProject(gulpTypescript.reporter.fullReporter()));
}
checkTypes.description =
  'Runs the TypeScript type checker on the codebase, displaying the output. This will display any ' +
  'serious errors in the code, such as invalid syntax or the use of incorrect types.';

function watchChecker() {
  return watchPackages(gulp.task('checker'), { ignoreInitial: false });
}
watchChecker.description =
  'Runs the linter and TypeScript type checker on the entire codebase, watching for any changes ' +
  'made to the code. When changes are detected, the linter and TypeScript type checker are ' +
  'automatically rerun.';

gulp.task('transpile', transpile);

gulp.task('bundle', bundle);

const build = gulp.series(transpile, bundle);
build.description =
  'Transpiles the sources for each package and creates bundles for the frontend packages.';
gulp.task('build', build);

gulp.task('serve:frontend', serveFrontend);

// TODO: Note that if you're not running watch or watch:server, restartServer doesn't actually
// explicitly kill the original node instance.
gulp.task('restart:server', restartServer);

gulp.task('watch:transpile', watchTranspile);

gulp.task('watch:build', watchBuild);

const watchFrontend = gulp.series(serveFrontend, function watchReloadBrowser() {
  return watchPackages(gulp.series(reloadBrowser), {}, 'dist');
});
watchFrontend.description =
  'Serves the frontend app like serve:frontend, but automatically reloads the app in the browser ' +
  'whenever the frontend bundle changes. Note that in order to automatically rebundle the ' +
  'frontend, you will need to run a command like watch:build.';
gulp.task('watch:frontend', watchFrontend);

gulp.task('watch:server', watchServer);

gulp.task('format:lint', formatLint);

gulp.task('checker:lint', checkLint);

gulp.task('checker:types', checkTypes);

const checker = gulp.series(checkTypes, checkLint);
checker.description =
  'Runs the linter and TypeScript type checker on the codebase, displaying the output. This is the ' +
  'same as running the checker:types and checker:lint commands in succession. Use the ' +
  'watch:checker command to automatically rerun this command when changes are made.';
gulp.task('checker', checker);

gulp.task('watch:checker', watchChecker);

const watch = gulp.series(
  transpile,
  restartServer,
  bundle,
  serveFrontend,
  function rebuild() {
    return watchPackages(gulp.series(transpile, restartServer, bundle, reloadBrowser));
  },
);
watch.description =
  'Watches for any changes in the src folder of each package. If a change is detected then the ' +
  'code will be transpiled, before rebundling the frontend, restarting the backend, and ' +
  'reloading the frontend in the browser.';
gulp.task('watch', watch);

const defaultTask = gulp.series('watch');
defaultTask.description =
  'Same as the watch command. Use it to spin up a backend and frontend server instance for testing ' +
  'your code in a dev environment.';
gulp.task('default', defaultTask);

process.on('exit', () => {
  if (backendNode) {
    // Kill off the backend node instance
    backendNode.kill();
  }
});
