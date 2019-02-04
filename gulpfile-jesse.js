// --------------------------------------------
// Dependencies
// --------------------------------------------
var autoprefixer = require('gulp-autoprefixer')
var lessAutoprefix = require('less-plugin-autoprefix'),
    concat = require('gulp-concat'),
    del = require('del'),
    gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    plumber = require('gulp-plumber'),
    // sass = require('gulp-sass'),
    // srcmaps = require('gulp-srcmaps'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    images = require('gulp-imagemin'),
    browserSync = require('browser-sync').create();


// paths
var styleSrc = 'src/assets/styles/',
    styleDest = 'build/assets/css/',
    htmlSrc = 'src/',
    htmlDest = 'build/',
    vendorSrc = 'src/assets/js/vendors/',
    vendorDest = 'build/assets/js/',
    scriptSrc = 'src/assets/js/*.js',
    scriptDest = 'build/assets/js/';



// --------------------------------------------
// Stand Alone Tasks
// --------------------------------------------


// Compiles all SASS files
// gulp.task('sass', function() {
//     gulp.src('src/sass/**/*.sass')
//         .pipe(plumber())
//         .pipe(sass({
//             style: 'compressed'
//         }))
//         .pipe(rename({
//             basename: 'main',
//             suffix: '.min'
//         }))
//
//         .pipe(gulp.dest('build/assets/css'));
// });

gulp.task('less', function () {
    console.log('starting styles task');
    return gulp.src(styleSrc+'bootstrap.less',{sourcemaps: true})
        .pipe(plumber(function (err) {
            console.log('Styles Task Error');
            console.log(err);
        }))
        .pipe(less({
            // plugins: [lessAutoprefix]
        }))
        .pipe(gulp.dest(styleDest))
});

gulp.task('images', function() {
    gulp.src('src/assets/images/*')
        .pipe(images())
        .pipe(gulp.dest('build/assets/images/'));
});

// Uglify js files
gulp.task('scripts', function() {
    gulp.src('src/assets/js/*.js')
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest('build/assets/js'));
});

//Concat and Compress Vendor .js files
gulp.task('vendors', function() {
    gulp.src(        [
            'src/assets/vendors/jquery/dist/jquery.js',
            'src/assets/vendors/*.js'
        ])
        .pipe(plumber())
        .pipe(concat('vendors.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/assets/js'));
});



// Watch for changes
gulp.task('watch', function(){

    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./build"
        },
        notify: false
    });



    // gulp.watch(styleSrc,['less']);
    gulp.watch("src/assets/**/*.less", gulp.parallel('less'));
    gulp.watch("src/assets/js/**/*.js", gulp.parallel('scripts'));
    gulp.watch("src/assets/vendors/**/*.js", gulp.parallel('vendors'));
    // gulp.watch(vendorSrc,['vendors']);
    // gulp.watch('build/*.html', 'build/assets/css/*.css', 'build/assets/js/*.js', 'build/assets/js/vendors/*.js').on('change', browserSync.reload);
    // gulp.watch('build/*.html', 'build/assets/css/*.css', 'build/assets/js/*.js', 'build/assets/js/vendors/*.js',gulp.parallel('watch')).on('change', browserSync.reload);

});

// gulp.task('watch', function(){
//     gulp.watch("src/**/*.html", gulp.parallel('bower')).on("change", browserSync.reload);
//     gulp.watch("src/assets/**/*.less", gulp.parallel('css')).on("change", browserSync.reload);
//     gulp.watch("src/assets/**/*.js", gulp.parallel('js')).on("change", browserSync.reload);
// });



// use default task to launch Browsersync and watch JS files
// gulp.task('default', [ 'less', 'scripts', 'vendors', 'watch'], function () {});
gulp.task('default', gulp.parallel('less', 'scripts','vendors','watch'));
