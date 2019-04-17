const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const nodemon = require('gulp-nodemon');
const eslint = require('gulp-eslint');
const concat = require('gulp-concat');

gulp.task('sass', () => {
    gulp.src('./scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./hosted'));
});

gulp.task('home', () => {
    gulp.src(['./client/*/*.js',  '!./client/login/*.js'])
        .pipe(babel({
            presets: ['env', 'react']
        })).pipe(concat('homeBundle.js'))
        .pipe(gulp.dest('./hosted/'));
});


gulp.task('login', () => {
    gulp.src(['./client/*/*.js', '!./client/app/*.js'])
        .pipe(babel({
            presets: ['env', 'react']
        }))
        .pipe(concat('loginBundle.js'))
        .pipe(gulp.dest('./hosted/'));
});

gulp.task('lint', () => {
    gulp.src('./server/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('build', () => {
    gulp.start('sass');
    gulp.start('home');
    gulp.start('login');
    gulp.start('lint');
});

gulp.task('watch', () => {
    gulp.watch('./scss/style.scss', ['sass']);
    gulp.watch('./client/app/*.js', ['home']);
    gulp.watch('./client/login/*.js', [ 'login']);
    nodemon({
        script: './server/app.js',
        ext: 'js',
        ignore: [],
        tasks: []
    });
});