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

gulp.task('transpile', function transpile() {
  return buildBabel();
});

gulp.task(
  'bundle',
  function bundle() {
    return buildBundle(frontendPackageName);
  },
  reloadBrowser,
);

gulp.task('build', gulp.series('transpile', 'bundle'));

gulp.task('serve:frontend', function serveFrontend(done) {
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
});

gulp.task('restart:server', function startBackend(done) {
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
});

gulp.task('watch:transpile', function watchTranspile() {
  return watchPackages(gulp.task('transpile'), { ignoreInitial: false });
});

gulp.task('watch:build', function watchBuild() {
  return watchPackages(gulp.task('build'), { ignoreInitial: false });
});

gulp.task(
  'watch:frontend',
  gulp.series('serve:frontend', function watchReloadBrowser() {
    return watchPackages(gulp.series(reloadBrowser), undefined, 'dist');
  }),
);

gulp.task('watch:server', function watchServer() {
  return watchPackages(gulp.task('restart:server'), undefined, 'lib');
});

gulp.task('format:lint', function formatLint() {
  return runLinter({ fix: true });
});

gulp.task('checker:lint', function checkLint() {
  return runLinter({ fix: false });
});

gulp.task('checker:types', checkTypes);

gulp.task('checker', gulp.series('checker:types', 'checker:lint'));

gulp.task('watch:checker', function startWatchChecker() {
  return watchPackages(gulp.task('checker'), { ignoreInitial: false });
});

/**
 * Watches for anything that intigates a build and reloads the backend and frontend
 */
gulp.task('watch', gulp.parallel('watch:build', 'watch:server', 'watch:frontend'));

gulp.task('default', gulp.task('watch'));

process.on('exit', () => {
  if (backendNode) {
    // Kill off the backend node instance
    backendNode.kill();
  }
});
