var gulp = require('gulp'),
  gutil = require('gulp-util'),
  uglify = require('gulp-uglify'),
  concat = require('gulp-concat'),
  jshint = require('gulp-jshint'),
  stylish = require('jshint-stylish'),
  streamqueue = require('streamqueue'),
  _open = require('gulp-open'),
  jsdoc = require("gulp-jsdoc");


var libs = "src/libs/*.js";
var modules = "src/modules/*.js";
var main = "src/main.js";

/************************************************************/
// Global setting to state which browser you are building for
var buildFor = "Chrome";
/************************************************************/

function timestamp() {
  var currentdate = new Date();
  var datetime = "Last update: " + currentdate.getDate() + "/" +
    (currentdate.getMonth() + 1) + "/" + currentdate.getFullYear() + " @ " +
    currentdate.getHours() + ":" +
    currentdate.getMinutes() + ":" +
    currentdate.getSeconds();
  return datetime;
}

function moveStuff(cfg) {
  return gulp.src(cfg.src)
    .pipe(gulp.dest(cfg.dest));
}

function exportTo(_dest) {
  moveStuff({
    src: "src/css/**",
    dest: _dest + "/css"
  });
  moveStuff({
    src: "src/build/*",
    dest: _dest + "/js"
  });
  moveStuff({
    src: "src/img/*",
    dest: _dest + "/img"
  });
}

/*
  Lint only the modules in the src folder
  TODO: probably also lint background.js and contentscript.js in Chrome folder
 */
gulp.task('lint', function() {
  return streamqueue({
      objectMode: true
    },
    gulp.src(modules),
    gulp.src(main)
  )
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});


/*
  Concat only the main router and modules
 */
gulp.task('concat', ['lint'], function() {
  // concat the modules as is
  streamqueue({
      objectMode: true
    },
    gulp.src(modules),
    gulp.src(main)
  )
    .pipe(concat('drivepass.js'))
    .pipe(gulp.dest('src/build'));

  // concat modules and minify
  streamqueue({
      objectMode: true
    },
    gulp.src(modules),
    gulp.src(main)
  )
    .pipe(uglify({
      outSourceMap: true
    }))
    .pipe(concat('drivepass.min.js'))
    .pipe(gulp.dest('src/build'));

  // concat the third party libraries separately
  gulp.src(libs)
    .pipe(concat('dp.libs.js'))
    .pipe(gulp.dest('src/build'));

});


/*
  move files to destination folder
*/
gulp.task('export', ['concat'], function() {
  exportTo(buildFor);
});

gulp.task("reload_chrome_extension", function() {
  var options = {
    url: "http://reload.extensions",
    app: "google-chrome"
  };
  gulp.src("./index.html") // A file must be specified as the src when running options.url or gulp will overlook the task.
  .pipe(_open("", options));
  return console.log(timestamp());
});


gulp.task('doc', function() {
  gulp.src("./src/modules/*.js")
    .pipe(jsdoc('./doc'));
});

gulp.task('watch', ['export'], function() {
  gulp.watch(modules, ['export']);
  gulp.watch(main, ['export']);
  gulp.watch('src/css/*.css', ['export']);
  gulp.watch('src/img/**', ['export']);
});

gulp.task('watch_chrome', ['export'], function() {
  buildFor = "Chrome";
  gulp.watch(modules, ['export', "reload_chrome_extension"]);
  gulp.watch(main, ['export', "reload_chrome_extension"]);

  gulp.watch('Chrome/background.js', ["reload_chrome_extension"]);
  gulp.watch('Chrome/js/contentscript.js', ["reload_chrome_extension"]);

  gulp.watch('src/css/*.css', ['export', "reload_chrome_extension"]);
  gulp.watch('src/img/**', ['export', "reload_chrome_extension"]);
});


gulp.task('default', ['export']);