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

/************************************************************/
// Global setting to state which browser you are building for

var buildFor = "Chrome";

/************************************************************/

function moveStuff(cfg) {
  return gulp.src(cfg.src)
    .pipe(changed(cfg.src))
    .pipe(gulp.dest(cfg.dest));
}
function exportTo(dest){
  moveStuff({src: "src/css/*", dest: dest+"/css"});
  moveStuff({src: "src/build/*", dest: dest+"/js"});
  return moveStuff({src: "src/img/*", dest: dest+"/img"});
}

gulp.task('lint', function() {
  gulp.src('src/*.js')
    .pipe(changed('src', { extension: '.js' }))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('concat',['lint'], function(){
  return streamqueue({ objectMode: true },
        gulp.src(libs),
        gulp.src(modules),
        gulp.src(main)
    )
      .pipe(concat('drivepass.js'))
      .pipe(gulp.dest('src/build'));
});

gulp.task('uglify', ['concat'], function(){
  gulp.src('src/build/drivepass.js')
    .pipe(uglify({outSourceMap: true}))
    .pipe(gulp.dest('src/build'))
});

gulp.task('export', ['uglify'], function() {
  exportTo(buildFor);
});

gulp.task('default', ['export'], function(){
  gulp.watch('src/*.js', ['export']);
});