/**
 * Inspiration for this file taken from https://github.com/babel/babel/blob/master/Gulpfile.js
 */
const colors = require('colors');
const { join, sep, resolve } = require('path');
const spawn = require('cross-spawn');

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const newer = require('gulp-newer');
const gulpWatch = require('gulp-watch');
const filter = require('gulp-filter');

const webpack = require('webpack');
const webpackStream = require('webpack-stream');

const historyApiFallback = require('connect-history-api-fallback');
const browserSync = require('browser-sync').create();

const through = require('through2');

const packagesDirName = 'packages';
const frontendPackageName = 'frontend';

let backendNode = undefined;

function swapSrcWith(srcPath, newDirName) {
  const parts = srcPath.split(sep);
  parts[1] = newDirName;
  return parts.join(sep);
}

function swapSrcWithLib(srcPath) {
  return swapSrcWith(srcPath, 'lib');
}

function rename(fn) {
  return through.obj(function(file, enc, callback) {
    file.path = fn(file);
    callback(null, file);
  });
}

function globFromPackagesDirName(dirName) {
  return [
    `./${dirName}/*/src/**/*.{js,jsx,ts,tsx}`,
    `!./${dirName}/*/src/**/__mocks__/*.{js,ts,tsx,jsx}`,
  ];
}

function compilationLogger(rollup) {
  return through.obj(function(file, enc, callback) {
    console.log(`Compiling '${file.relative.cyan}'`);
    callback(null, file);
  });
}

const packagesDir = join(__dirname, packagesDirName);
function buildBabel(exclude) {
  let stream = gulp.src(globFromPackagesDirName(packagesDirName), { base: packagesDir });

  if (exclude) {
    // We need to exclude things that get bundled
    const filters = exclude.map(p => `!**/${p}/**`);
    filters.unshift('**');
    stream = stream.pipe(filter(filters));
  }

  return stream
    .pipe(newer({ dest: packagesDir, map: swapSrcWithLib }))
    .pipe(compilationLogger())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(rename(file => resolve(file.base, swapSrcWithLib(file.relative))))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(packagesDir));
}

function createWebpackStream(packageDir) {
  const webpackConfig = require(join(packageDir, 'webpack.config'));
  return webpackStream(webpackConfig, webpack);
}

function buildBundle(packageName) {
  const packageDir = join(packagesDir, packageName);
  const stream = gulp.src(packageDir, 'src', 'index.tsx');
  return stream
    .pipe(createWebpackStream(packageDir))
    .pipe(gulp.dest(join(packageDir, 'dist')));
}

gulp.task('transpile', function transpile() {
  return buildBabel([frontendPackageName]);
});

gulp.task(
  'bundle',
  function bundle() {
    return buildBundle(frontendPackageName);
  },
  function reloadBrowser() {
    browserSync.reload();
  },
);

gulp.task('build', gulp.series('transpile', 'bundle'));

gulp.task('serve:frontend', function serveFrontend() {
  browserSync.init({
    server: {
      baseDir: './packages/frontend/dist',
      ws: true,
      // We need this so that routes work properly
      middleware: [historyApiFallback()],
    },
  });
});

gulp.task('restart:backend', function startBackend() {
  if (backendNode) {
    backendNode.kill();
  }
  const backendEnv = Object.create(process.env);
  backendEnv.NODE_ENV = 'development';
  backendNode = spawn('node', ['./packages/server/lib/index.js'], {
    stdio: 'inherit',
    env: backendEnv,
  });

  backendNode.on('close', function(code) {
    if (code === 8) {
      console.log('Error detected, waiting for changes...'.red);
    }
  });
});

/**
 * Watches for anything that intigates a build and reloads the backend and frontend
 */
gulp.task(
  'watch',
  gulp.series(
    'build',
    'restart:backend',
    gulp.parallel('serve:frontend', function watch() {
      return gulpWatch(
        globFromPackagesDirName(packagesDirName),
        { debounceDelay: 200 },
        gulp.series('build', 'restart:backend'),
      );
    }),
  ),
);

gulp.task('default', gulp.series('build'));

process.on('exit', () => {
  if (backendNode) {
    // Kill off the backend node instance
    backendNode.kill();
  }
});
