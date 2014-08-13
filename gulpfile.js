var browserify = require('browserify');

var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    source = require('vinyl-source-stream'),
    watch = require('gulp-watch');

gulp.task('js-redactor', function() {
  var bundleStream = browserify('./js/main-redactor.js').bundle();

  bundleStream
    .pipe(source('redactor.js'))
    .pipe(gulp.dest('./public'));
});

gulp.task('js-tredactor', function() {
  var bundleStream = browserify('./js/main-tile-redactor.js').bundle();

  bundleStream
    .pipe(source('tile-redactor.js'))
    .pipe(gulp.dest('./public'));
});

gulp.task('js', function() {
  var bundleStream = browserify('./js/main.js').bundle();

  bundleStream
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public'));
});

gulp.task('watch', ['js', 'js-redactor', 'js-tredactor'], function() {
  gulp.watch('js/**', ['js', 'js-redactor', 'js-tredactor'])
});

gulp.task('server', function(next) {
  var connect = require('connect'),
      server = connect();
  server.use(connect.static('./')).listen(process.env.PORT || 9999, next);
});

gulp.task('reload', ['server'], function() {
  var server = livereload();
  gulp.watch('public/**').on('change', function(event) {
      server.changed(event.path);
      console.log('File '+event.path+' was '+event.type+', running tasks...');
  });
});

gulp.task('default', ['watch']);
