var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var _open = require('gulp-open');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
// var jsdoc = require("gulp-jsdoc");
var rename = require("gulp-rename");

/**********************************************
 * Javascript Section
 * 1. jshint
 * 2. concat
 * 3. minify
 * 4. move to destination folder
 */

var libs = "src/libs/*.js";
var modules = "src/modules/*.js";
var main = "src/main.js";

// TODO: probably also lint background.js and contentscript.js in Chrome folder
gulp.task('lint', function() {
  gulp.src(modules)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));

  return gulp.src(main)
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
});

/* Concat only main.js with modules */
gulp.task('concat', ['lint'], function() {

  // concat the modules as is
  gulp.src([modules, main])
    .pipe(concat('drivepass.js'))
    .pipe(gulp.dest('src/build'));

  // concat the third party libraries separately
  return gulp.src(libs)
    .pipe(concat('dp.libs.js'))
    .pipe(gulp.dest('src/build'));
});

gulp.task('minify', ['concat'], function() {

  return gulp.src('./src/build/drivepass.js')
    .pipe(uglify({
      outSourceMap: true
    }))
    .pipe(rename("drivepass.min.js"))
    .pipe(gulp.dest('src/build'));
});

// JSDoc stuff
// gulp.task('doc', function() {
//   gulp.src("./src/modules/*.js")
//     .pipe(jsdoc('./doc'));
// });

/**********************************************
 * Move files to current destination folder
 */

// Global setting to state which browser you are building for
var buildFor = "Chrome";

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

gulp.task('export', ['minify'], function() {
  exportTo(buildFor);
});

/**********************************************
 * Reload Chrome Extension
 */

gulp.task("reload_chrome_extension", function() {
  var options = {
    url: "http://reload.extensions",
    app: "google-chrome"
  };
  return gulp.src("./index.html") // A file must be specified as the src when running options.url or gulp will overlook the task.
    .pipe(_open("", options));
});

/**********************************************
 * Watch
 */

gulp.task('watch', ['export'], function() {
  gulp.watch(modules, ['export']);
  gulp.watch(main, ['export']);
  gulp.watch('src/css/*.css', ['export']);
  gulp.watch('src/img/**', ['export']);
});

gulp.task('watch_chrome', ['export'], function() {
  // override buildFor just in case it has been set to something else
  buildFor = "Chrome";
  gulp.watch(modules, ['export', "reload_chrome_extension"]);
  gulp.watch(main, ['export', "reload_chrome_extension"]);

  gulp.watch('Chrome/background.js', ["reload_chrome_extension"]);
  gulp.watch('Chrome/js/contentscript.js', ["reload_chrome_extension"]);

  gulp.watch('src/css/*.css', ['export', "reload_chrome_extension"]);
  gulp.watch('src/img/**', ['export', "reload_chrome_extension"]);
});


gulp.task('default', ['export']);