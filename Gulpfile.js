/**
 * Inspiration for this file taken from https://github.com/babel/babel/blob/master/Gulpfile.js
 */
const colors = require('colors');
const { join, sep, resolve } = require('path');

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const newer = require('gulp-newer');
const gulpWatch = require('gulp-watch');
const filter = require('gulp-filter');

const webpack = require('webpack-stream');

const through = require('through2');

const packagesDirName = 'packages';

function swapSrcWith(srcPath, newDirName) {
  const parts = srcPath.split(sep);
  parts[1] = newDirName;
  return parts.join(sep);
}

function swapSrcWithLib(srcPath) {
  return swapSrcWith(srcPath, 'lib');
}

function swapSrcWithDist(srcPath) {
  return swapSrcWith(srcPath, 'dist');
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

const base = join(__dirname, packagesDirName);
function buildBabel(exclude) {
  let stream = gulp.src(globFromPackagesDirName(packagesDirName), { base });

  if (exclude) {
    // We need to exclude things that get bundled
    const filters = exclude.map(p => `!**/${p}/**`);
    filters.unshift('**');
    stream = stream.pipe(filter(filters));
  }

  return stream
    .pipe(newer({ dest: base, map: swapSrcWithLib }))
    .pipe(compilationLogger())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(rename(file => resolve(file.base, swapSrcWithLib(file.relative))))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(base));
}

function buildBundle(packageName) {
  const stream = gulp.src(join(base, packageName, 'src', 'index.tsx'));
  return stream
    .pipe(webpack(require(join(base, packageName, 'webpack.config'))))
    .pipe(gulp.dest(join(base, packageName, 'dist')));
}

gulp.task('transpile', function transpile() {
  return buildBabel(['frontend']);
});

gulp.task('bundle', function bundle() {
  return buildBundle('frontend');
});

gulp.task('build', gulp.series('transpile', 'bundle'));

gulp.task(
  'watch',
  gulp.series('build', function watch() {
    gulpWatch(
      globFromPackagesDirName(packagesDirName),
      { debounceDelay: 200 },
      gulp.task('build'),
    );
  }),
);

gulp.task('default', gulp.series('build'));
