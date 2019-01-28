var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    jsmin = require('gulp-jsmin'),
    imageop = require('gulp-image-optimization'),
    htmlBower = require('gulp-html-bower'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    htmlmin = require('gulp-htmlmin'),
    less = require('gulp-less'),
    del = require('del'),
    LessAutoprefix = require('less-plugin-autoprefix');
    var lessAutoprefix = new LessAutoprefix({
        browsers: ['last 2 versions']
    });
    var imagemin = require('gulp-imagemin'),
        imageminPngquant = require('imagemin-pngquant'),
        imageminJpegcompress = require('imagemin-jpeg-recompress');





// File paths
var DIST_PATH =    './build/';
var SCRIPTS_PATH = './src/scripts/**/*.js';
var VENDPATH =     './src/components/**/*.js';
var IMAGES_PATH = './src/images/**/*.{png,jpeg,jpg,svg,gif}';

gulp.task('sync', function () {
    browserSync.init({
        server: {
            baseDir: "build"
        }
    });
});



gulp.task('css', function () {
    console.log('starting styles task');
    return gulp.src('src/styles/bootstrap.less')
        .pipe(plumber(function (err) {
            console.log('Styles Task Error');
            console.log(err);
            // this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(less({
            plugins: [lessAutoprefix]
        }))
        .pipe(gulp.dest(DIST_PATH+'/css'))
        .pipe(browserSync.stream());


});

gulp.task('js', function () {
    return gulp.src('src/scripts/*.js')
        .pipe(jsmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('build/js'));
});

gulp.task('images', function () {
    console.log('starting images task');

    return gulp.src(IMAGES_PATH)
        .pipe(plumber(function (err) {
            console.log('Images Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(imagemin(
            [
                imagemin.gifsicle(),
                imagemin.jpegtran(),
                imagemin.optipng(),
                imagemin.svgo(),
                imageminPngquant(),
                imageminJpegcompress()
            ]
        ))
        .pipe(gulp.dest(DIST_PATH + '/images'))
});


gulp.task('clean', function () {
    console.log('starting clean task');

    return del.sync([
        DIST_PATH
    ]);
})

gulp.task('bower', function() {
    return gulp.src('src/**/*.html')
        .pipe(htmlBower({
            basedir: 'src',
            prefix: 'components',
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('build'));
});

gulp.task('watch', function(){
    gulp.watch("src/**/*.html", gulp.parallel('bower')).on("change", browserSync.reload);
    gulp.watch("src/**/*.less", gulp.parallel('css')).on("change", browserSync.reload);
    gulp.watch("src/**/*.js", gulp.parallel('js')).on("change", browserSync.reload);
});

gulp.task('default', gulp.parallel('clean','watch', 'sync','images'));