var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    changed = require('gulp-changed'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    streamqueue = require('streamqueue');

var libs = "src/libs/*.js";
var modules = "src/dp.*.js";
var main = "src/main.js";
var build = "src/build/*.js"; // only used to copy it

gulp.task('lint', function() {
  gulp.src('src/*.js')
    .pipe(changed('src', { extension: '.js' }))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

gulp.task('concat',function(){
  return streamqueue({ objectMode: true },
        gulp.src(libs),
        gulp.src(modules),
        gulp.src(main)
    )
      .pipe(concat('drivepass.js'))
      .pipe(gulp.dest('src/build'));
});

gulp.task('uglify', function(){
  gulp.src('src/build/drivepass.js')
    .pipe(uglify({outSourceMap: true}))
    .pipe(gulp.dest('src/build'))
});

gulp.task('chrome', function() {
  // move images to Chrome folder
  // move css to Chrome folder
  // move build to Chrome folder
});

// gulp watch
// run default but only changed files

// gulp.watch chrome
// only move over changed files