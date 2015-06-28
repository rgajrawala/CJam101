var gulp = require('gulp');
var rename = require('gulp-rename');
// var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
// var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
// var jsx = require('gulp-jsx');
// var callback = require('gulp-callback');
var util = require('gulp-util');

gulp.task('js', function() {
	return gulp.src(['src/js/*.js'])
//		.pipe(jsx())
//		.pipe(sourcemaps.init())
			.pipe(uglify().on('error', util.log))
			.pipe(rename({ extname: '.min.js' }))
//			.pipe(concat('main.min.js'))
//		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build/js'));
});

gulp.task('sass', function() {
	return gulp.src(['src/sass/*.scss'])
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('build/css'));
});

gulp.watch('src/js/*.js', ['js']);
gulp.watch('src/sass/*.scss', ['sass']);

console.log('Watching...\n');
