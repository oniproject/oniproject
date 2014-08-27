var browserify = require('browserify'),
	watchify = require('watchify'),
	partialify = require('partialify'),
	exorcist   = require('exorcist'),
	transform =require('vinyl-transform'),
	gulp = require('gulp'),
	livereload = require('gulp-livereload'),
	watch = require('gulp-watch'),
	source = require('vinyl-source-stream');

var dest = './public/';
var apps = {
	game:      {dest: 'main.js',      source: './js/main.js'},
	redactor:  {dest: 'redactor.js',  source: './redactor/map/main.js'},
	tredactor: {dest: 'tredactor.js', source: './redactor/tile/main.js'},
	a2d:       {dest: 'a2d.js',       source: './redactor/a2d/main.js'},
}

function handleErrors(err) {
	var args = Array.prototype.slice.call(arguments);
	console.error(err.toString());
	this.emit('end');
}

var fn = function(app, isWatching) {
	return function() {
		var bundler = browserify({
			// Required watchify args
			cache: {}, packageCache: {}, fullPaths: true,
			// Browserify Options
			entries: [app.source],
			//extensions: ['.coffee', '.hbs', ],
			debug: true
		});

		var bundle = function() {
			return bundler
				.transform(partialify)
				.bundle().on('error', handleErrors)
				.pipe(source(app.dest))
				.pipe(transform(function () { return exorcist(dest+app.dest+'.map'); }))
				.pipe(gulp.dest(dest));
		};

		if(isWatching) {
			bundler = watchify(bundler);
			bundler.on('update', bundle);
		}

		return bundle();
	}
}

var w = [];
var b = [];
for(var k in apps) {
	gulp.task('browserify-' + k, fn(apps[k], false));
	gulp.task('watch-' + k, fn(apps[k], true));
	b.push('browserify-' + k);
	w.push('watch-' + k);
}

gulp.task('watch', w);
gulp.task('build', b);

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
