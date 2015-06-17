// include gulp
var gulp = require('gulp');

// include plug-ins
var jshint = require('gulp-jshint');
var csslint = require('gulp-csslint');
var stylish = require('jshint-stylish');
var nodemon = require('gulp-nodemon');
var less = require('gulp-less');
var install = require('gulp-install');

// Installation task
gulp.task('install', function() {
    gulp.src(
        [
            './package.json',
            './bower.json'
        ])
        .pipe(install());
});

// JS Hint task
gulp.task('jshint', function() {
    gulp.src(
        [
            '*.js',
            '*.ejs',
            'config/*.js',
            'routes/*.js',
            'models/*.js',
            'public/js/*.js'
        ],
        { base: '/' })
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'));
});

// CSS Lint task
gulp.task('csslint', function() {
    gulp.src('public/css/*.css')
        .pipe(csslint())
        .pipe(csslint.reporter(stylish));
});

// LESS compilation into CSS task
gulp.task('less-compilation', function() {
    gulp.src('./public/less/*.less')
        .pipe(less({
            paths: ['./public/less']
        }))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('develop', function() {
    nodemon(
        {
            script: 'app.js',
            ext: 'html js css json ejs less',
            ignore: ['gulpfile.js'],
            tasks: ['less-compilation', 'jshint'],
            env: { 'NODE_ENV' : 'development'}
        })
        .on('restart', function() {
            console.log('Node Restarted!');
        });

});

gulp.task('default', ['install', 'less-compilation', 'jshint', 'develop'], function() {
    console.log('Gulp Running!');
});