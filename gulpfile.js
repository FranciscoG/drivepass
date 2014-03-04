var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    streamqueue = require('streamqueue'),
    open = require('gulp-open');

var libs = "src/libs/*.js";
var modules = "src/modules/*.js";
var main = "src/main.js";

/************************************************************/
// Global setting to state which browser you are building for
var buildFor = "Chrome";
/************************************************************/
function timestamp(){
  var currentdate = new Date(); 
  return datetime = "Last update: " + currentdate.getDate() + "/"
    + (currentdate.getMonth()+1)  + "/" 
    + currentdate.getFullYear() + " @ "  
    + currentdate.getHours() + ":"  
    + currentdate.getMinutes() + ":" 
    + currentdate.getSeconds();
}
function moveStuff(cfg) {
  return gulp.src(cfg.src)
    .pipe(gulp.dest(cfg.dest));
}
function exportTo(_dest){
  moveStuff({src: "src/css/**", dest: _dest+"/css"});
  moveStuff({src: "src/build/*", dest: _dest+"/js"});
  moveStuff({src: "src/img/*", dest: _dest+"/img"});
}

gulp.task('lint', function() {
  return streamqueue({ objectMode: true },
        gulp.src(modules),
        gulp.src(main)
    )
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish));
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
  return console.log(timestamp());
});

gulp.task("reload_chrome_extension", function(){
  var options = {
    url: "http://reload.extensions",
    app: "google-chrome"
  };
  gulp.src("./index.html")
  .pipe(open("", options));
  return console.log(timestamp());
});
// A file must be specified as the src when running options.url or gulp will overlook the task.


gulp.task('watch', ['export'], function(){
  gulp.watch(modules, ['export']);
  gulp.watch(main, ['export']);
  gulp.watch('src/css/*.css', ['export']);
  gulp.watch('src/img/**', ['export']);
});

gulp.task('watch_chrome', ['export'], function(){
  gulp.watch(modules, ['export', "reload_chrome_extension"]);
  gulp.watch(main, ['export', "reload_chrome_extension"]);
  gulp.watch('Chrome/background.js', ["reload_chrome_extension"]);
  gulp.watch('Chrome/js/contentscript.js', ["reload_chrome_extension"]);
  gulp.watch('src/css/*.css', ['export', "reload_chrome_extension"]);
  gulp.watch('src/img/**', ['export', "reload_chrome_extension"]);
});

gulp.task('default', ['export']);

