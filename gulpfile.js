var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    changed = require('gulp-changed'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    streamqueue = require('streamqueue');

var libs = "src/libs/*.js";
var modules = "src/modules/*.js";
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
function exportTo(_dest){
  moveStuff({src: "src/css/*", dest: _dest+"/css"});
  moveStuff({src: "src/build/*", dest: _dest+"/js"});
  return moveStuff({src: "src/img/*", dest: _dest+"/img"});
}

gulp.task('lint', function() {
  return streamqueue({ objectMode: true },
        gulp.src(modules),
        gulp.src(main)
    )
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

gulp.task('watch', ['export'], function(){
  gulp.watch('src/*.js', ['export']);
  gulp.watch('src/css/*.css', ['export']);
  gulp.watch('src/img/**', ['export']);
});

gulp.task('default', ['export']);

