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
    sort = require('gulp-sort'),
    browserify = require('browserify');
const babel = require('gulp-babel');

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
    STYLESRC =  './src/assets/styles/',
    STYLEDEST = './build/assets/css/',
    HTMLSRC =   './src/**/*.html',
    HTMLDEST = './build/',
    BCOMPONENTS = './components/**',

    VENDSRC = './src/assets/vendors/**',
    VENDDEST = './build/assets/vendors/',

    SCRIPTSRC  = './src/assets/js/**.js',
    SCRIPTSRCF = './src/assets/js/.js',


    SCRIPTDEST = 'build/assets/js/',

    IMAGESSRC = './src/assets/images/**/*.{png,jpeg,jpg,svg,gif}',
    IMAGESDEST = './build/assets/images/';

gulp.task('sync', function () {
    browserSync.init({
        server: {
            baseDir: "build"
        }
    });
});


// var vendorStream = gulp.src(['./src/components/*.js'], {read: false});
// var vendStream = gulp.src(mainBowerFiles(), { base: VENDSRC });

    // scriptAppStream = gulp.src([SCRIPTSRC], {read: false}),
    // stylesVendStream = gulp.src(mainBowerFiles(['**/*.css']), { base: VENDDEST }),
    // stylesAppStream = gulp.src([STYLESRC], {read: false});


gulp.task('css', function () {
    console.log('starting styles task');
    return gulp.src(STYLESRC+'bootstrap.less',{sourcemaps: true})
        .pipe(plumber(function (err) {
            console.log('Styles Task Error');
            console.log(err);
        }))
        .pipe(less({
            // plugins: [lessAutoprefix]
        }))
        .pipe(gulp.dest(STYLEDEST))
});

// gulp.task('js', function () {
//     return gulp.src(SCRIPTSRC)
//         .pipe(jsmin())
//         .pipe(rename({
//             suffix: '.min'
//         }))
//         .pipe(gulp.dest(SCRIPTDEST));
// });
gulp.task('js', function () {
    console.log('starting scripts task');

    return gulp.src(SCRIPTSRC)
        .pipe(plumber(function (err) {
            console.log('Scripts Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(sourcemaps.init())
        .pipe(babel({
            minified: true,
            presets: ['es2015']
        }))
        .pipe(concat('scripts.js'))
        .pipe(rename({
             suffix: '.min'
         }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(SCRIPTDEST));
});

/*gulp.task('js', function () {
    console.log('starting js task');
    return gulp.src(SCRIPTSRC)
        // .pipe(sort())
        .pipe(plumber(function (err) {
            console.log('Scripts Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(SCRIPTDEST))
        .pipe(sourcemaps.write());
});*/

/*===============================
* VENDOR CODES
*--------------------------------*/
//Maak een kopie van alle essentieële bower files uit het originele "components" mapje.
//Zet deze bestanden dan in de src
gulp.task('createvendorsrc', function () {
    console.log('copy vendor files from main BOWER folder into src folder');
    return gulp.src(mainBowerFiles(), { base: BCOMPONENTS })
        .pipe(sort())
        .pipe(plumber(function (err) {
            console.log('Scripts Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(gulp.dest(VENDSRC));
});

//Maak (nog) een kopie van alle (essentieële) bower files.
// Zet deze dit keer in het build mapje
gulp.task('buildvendordist', function () {
    console.log('copy vendor files from src folder into build folder');



    return gulp.src(VENDSRC)

        .pipe(sort())
        .pipe(plumber(function (err) {
            console.log('Scripts Task Error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(gulp.dest(VENDDEST));
});
// Injecteer alle vendor bestanden in de index.html file
gulp.task('inject', function () {
    return gulp.src('src/index.html')
        .pipe(plumber(function (err) {
            console.log('Inject error');
            console.log(err);
            this.emit('end');
        }))
        .pipe(inject((gulp.src(VENDSRC)),{ignorePath: 'src'})) // This will always inject vendor files before app files
        .pipe(gulp.dest('src/'));
});


gulp.task('makevendors', gulp.series('createvendorsrc', 'buildvendordist','inject'));



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



gulp.task('bower', function() {
    return gulp.src('src/**/*.html')
        .pipe(htmlBower({
            basedir: 'src/assets',
            prefix: 'components',
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('build'));
});


gulp.task('watch', function(){
    gulp.watch("src/**/*.html", gulp.parallel('bower')).on("change", browserSync.reload);
    gulp.watch("src/assets/**/*.less", gulp.parallel('css')).on("change", browserSync.reload);
    gulp.watch("src/assets/**/*.js", gulp.parallel('js')).on("change", browserSync.reload);
});

gulp.task('default', gulp.parallel('watch', 'sync','images'));