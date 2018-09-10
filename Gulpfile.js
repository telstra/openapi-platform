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

function globLibFromPackagesDirName(dirName) {
  return globFolderFromPackagesDirName(dirName, 'lib');
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

function checkTypes() {
  const stream = packagesSrcStream();
  return stream.pipe(tsProject(gulpTypescript.reporter.fullReporter()));
}

function runLinter({ fix }) {
  const stream = packagesSrcStream();
  return stream
    .pipe(
      gulpTslint({
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
  const { readConfig } = require('@openapi-platform/config');
  const openapiPlatformConfig = readConfig();
  const createWebpackConfig = require(join(packageDir, 'webpack.config'));
  const webpackConfig = createWebpackConfig({
    NODE_ENV: process.env.NODE_ENV,
    API_PORT: openapiPlatformConfig.get('server.port'),
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

function transpile() {
  return buildBabel();
}

function bundle() {
  return buildBundle(frontendPackageName);
}

function watchTranspile() {
  return watchPackages(transpile, { ignoreInitial: false });
}

function watchBuild() {
  return watchPackages(build, { ignoreInitial: false });
}

function watchFrontend() {
  return gulp.series(serveFrontend, function watchReloadBrowser() {
    return watchPackages(gulp.series(reloadBrowser), undefined, 'dist');
  });
}

function watchServer() {
  return watchPackages(restartServer, { ignoreInitial: false }, 'lib');
}

function formatLint() {
  return runLinter({ fix: true });
}

function checkLint() {
  return runLinter({ fix: false });
}

function watchChecker() {
  return watchPackages(gulp.task('checker'), { ignoreInitial: false });
}

gulp.task('transpile', transpile);

bundle.description = 'Creates bundles for frontend packages';
gulp.task('bundle', bundle);

const build = gulp.series(transpile, bundle);
build.description = 'Transpiles all packages and then creates bundles for frontend packages';
gulp.task('build', build);

serveFrontend.description = 'Serves the frontend app on a port specified in the OpenAPI Platform config file';
gulp.task('serve:frontend', serveFrontend);

// TODO: Note that if you're not running watch or watch:server, restartServer doesn't actuall explicitly kill the original node instance.
gulp.task('restart:server', restartServer);

gulp.task('watch:transpile', watchTranspile);

gulp.task('watch:build', watchBuild);

gulp.task('watch:frontend', watchFrontend);

gulp.task('watch:server', watchServer);

gulp.task('format:lint', formatLint);

gulp.task('checker:lint', checkLint);

gulp.task('checker:types', checkTypes);

const checker = gulp.series(checkTypes, checkLint);
gulp.task('checker', checker);

gulp.task('watch:checker', watchChecker);

const watch = gulp.series(
  transpile,
  restartServer,
  bundle,
  serveFrontend,
  function rebuild() {
    return watchPackages(
      gulp.series(
        transpile, 
        restartServer,
        bundle,
        reloadBrowser
      )
    );
  }
);
watch.description = 'Watches for anything that intigates a build and reloads the backend and frontend';
gulp.task('watch', watch);

const defaultTask = gulp.series('watch');
defaultTask.description = "It's just watch, use it if you want to spin up every server instance you'll need for testing your code in a dev environment";
gulp.task('default', gulp.series('watch'));

process.on('exit', () => {
  if (backendNode) {
    // Kill off the backend node instance
    backendNode.kill();
  }
});
