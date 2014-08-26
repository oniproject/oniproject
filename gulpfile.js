var browserify = require('browserify'),
	watchify = require('watchify'),
	gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	watch = require('gulp-watch'),
	source = require('vinyl-source-stream');

var dest = './public/';
var apps = {
	game:      {dest: 'main.js',      source: './js/main.js'},
	redactor:  {dest: 'redactor.js',  source: './js/main-redactor.js'},
	tredactor: {dest: 'tredactor.js', source: './js/main-tile-redactor.js'},
}

var updateFN = function(app) {
	return function() {
		return browserify(app.source).bundle()
			.pipe(source(app.dest))
			.pipe(gulp.dest(dest));
	}
}
var watchFN = function(app) {
	return function() {
		var bundler = watchify(browserify({
			cache: {},
			entries: apps.game.source
		}));
		bundler.on('update', rebundle);
		function rebundle() {
			return bundler.bundle()
				.pipe(source(apps.game.dest))
				.pipe(gulp.dest(dest));
		}
		return rebundle();
	}
}

var w = [];
var b = [];
for(var k in apps) {
	gulp.task('browserify-' + k, updateFN(apps[k]));
	gulp.task('watch-' + k, watchFN(apps[k]));
	b.push('browserify-' + k);
	w.push('watch-' + k);
	console.log(k);
}

gulp.task('watch', w);
gulp.task('js', b);

gulp.task('default', ['watch']);

/* reload */
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
