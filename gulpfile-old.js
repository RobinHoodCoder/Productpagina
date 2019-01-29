// --------------------------------------------
// Dependencies
// --------------------------------------------
var gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    //autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    jsmin = require('gulp-jsmin'),
    imageop = require('gulp-image-optimization'),
    htmlBower = require('gulp-html-bower'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    htmlmin = require('gulp-htmlmin'),
    less = require('gulp-less'),
    clean = require('gulp-clean'),
    LessAutoprefix = require('less-plugin-autoprefix'),
    series = require('stream-series'),
    inject = require('gulp-inject')
    mainBowerFiles = require('main-bower-files'),
    concat = require('gulp-concat'),
    sort = require('gulp-sort');

    var lessAutoprefix = new LessAutoprefix({
        browsers: ['last 2 versions']
    });
    var imagemin = require('gulp-imagemin'),
        imageminPngquant = require('imagemin-pngquant'),
        imageminJpegcompress = require('imagemin-jpeg-recompress');


// File paths
/*var styleSrc = 'source/sass/!**!/!*.sass',
    styleDest = 'build/assets/css/',
    htmlSrc = 'source/',
    htmlDest = 'build/',
    vendorSrc = 'source/js/vendors/',
    vendorDest = 'build/assets/js/',
    scriptSrc = 'source/js/!*.js',
    scriptDest = 'build/assets/js/';*/
const
    STYLESRC =  'src/styles/',
    STYLEDEST = 'build/css/',
    HTMLSRC =   'src/**/*.html',
    HTMLDEST = 'build/',
    VENDSRC = 'components/',
    VENDDEST = 'build/js/vendors/',
    SCRIPTSRC = 'src/js/!*.js',
    SCRIPTDEST = 'build/js/',
    IMAGESSRC = 'src/images/**/*.{png,jpeg,jpg,svg,gif}',
    IMAGESDEST = 'build/images/'
;


gulp.task('sync', function () {
    browserSync.init({
        server: {
            baseDir: "build"
        }
    });
});


// var vendorStream = gulp.src(['./src/components/*.js'], {read: false});
var scriptVendStream = gulp.src(mainBowerFiles(['**/*.js']), { base: VENDDEST }),
    scriptAppStream = gulp.src([SCRIPTSRC], {read: false}),
    stylesVendStream = gulp.src(mainBowerFiles(['**/*.css']), { base: VENDDEST }),
    stylesAppStream = gulp.src([STYLESRC], {read: false});


gulp.task('css', function () {
    console.log('starting styles task');
    return gulp.src(STYLESRC+'bootstrap.less')
        .pipe(plumber(function (err) {
            console.log('Styles Task Error');
            console.log(err);
            // this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(less({
            plugins: [lessAutoprefix]
        }))
        .pipe(gulp.dest(STYLEDEST))
        .pipe(browserSync.stream());


});

// gulp.task('js', function () {
//     return gulp.src(SCRIPTSRC)
//         .pipe(jsmin())
//         .pipe(rename({
//             suffix: '.min'
//         }))
//         .pipe(gulp.dest(SCRIPTDEST));
// });
// gulp.task('js', function () {
//     console.log('starting scripts task');
//
//     return gulp.src(SCRIPTSRC)
//         .pipe(plumber(function (err) {
//             console.log('Scripts Task Error');
//             console.log(err);
//             this.emit('end');
//         }))
//         .pipe(sourcemaps.init())
//         // .pipe(babel({
//         //     presets: ['es2015']
//         // }))
//         // .pipe(uglify())
//         .pipe(jsmin())
//         // .pipe(concat('scripts.js'))
//         .pipe(rename({
//              suffix: '.min'
//          }))
//         .pipe(sourcemaps.write())
//         .pipe(gulp.dest(SCRIPTDEST));
// });

gulp.task('js', function () {
    console.log('starting js task');

    return gulp.src(mainBowerFiles(), { base: VENDSRC })
        .pipe(sort())
        .pipe(plumber(function (err) {
            console.log('Scripts Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(concat('vends.js'))
        .pipe(gulp.dest(SCRIPTDEST))
        .pipe(sourcemaps.write());
});




gulp.task('images', function () {
    console.log('starting images task');

    return gulp.src(IMAGESSRC)
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
        .pipe(gulp.dest(IMAGESDEST))
});
// gulp.task('clean', function() {
//     return gulp.src([STYLEDEST, SCRIPTDEST, IMAGESDEST])
//         .pipe(clean())
// });


gulp.task('inject', function () {
    // console.log(mainBowerFiles(), { base: VENDSRC });
    scriptVendStream = gulp.src(mainBowerFiles(), { base: VENDSRC });

    // console.log(mainBowerFiles(['**/*.css']), { base: VENDDEST });
    return gulp.src('src/index.html')
        .pipe(inject(series(scriptVendStream, scriptAppStream, stylesVendStream, stylesAppStream))) // This will always inject vendor files before app files
        .pipe(gulp.dest('src/'));
});


gulp.task('watch', function(){
    gulp.watch("src/**/*.less", gulp.parallel('css')).on("change", browserSync.reload);
    gulp.watch("src/**/*.js", gulp.parallel('js')).on("change", browserSync.reload);
});

gulp.task('default', gulp.parallel('watch', 'sync','images'));