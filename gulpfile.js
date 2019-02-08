"use strict";
const { src, dest, parallel, series } = require('gulp');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const inject = require('gulp-inject');
var uglify = require('gulp-uglify');

// Vendors with bower
const mainBowerFiles = require('main-bower-files');

// const pug = require('gulp-pug');

const postcss = require("gulp-postcss");
const flatten = require("gulp-flatten");

const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require("gulp-plumber");
const eslint = require("gulp-eslint");
const del = require("del");

const webpack = require("webpack");
const webpackconfig = require("./webpack.config.js");
const webpackstream = require("webpack-stream");


// function html() {
//     return src('src/templates/*.pug')
//         .pipe(pug())
//         .pipe(dest('build/html'))
// }

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./build/"
        },
        port: 3000
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

function injecthtml(){
    const htmltarget = ('./src/index.html');
    return src(htmltarget)
        .pipe(inject(
            src([
                './build/assets/vendors/**/*.js',
                './build/assets/vendors/**/*.css',
                './build/assets/js/**/*.js'
            ],
                {
                    read: false
                }
                ),{
                ignorePath: 'build',
                addRootSlash: true
                }

        )) // This will always inject vendor files before app files
        .pipe(dest('src/'));
}

function updatevendors(){
    return src(mainBowerFiles(), { base: './components/' })
        .pipe(plumber(function (err) {
            console.log('Bower Task Error');
            console.log(err);
        }))
        .pipe(gulp.dest('./src/assets/vendors'))
}

//Copy html to build map
function htmldest() {
    return src("./src/**/*.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('./build/'));
}

// Lint scripts
function scriptsLint() {
    return src(["./src/vendors/**/*","./src/assets/js/**/*", "./gulpfile.js"])
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format())
        // .pipe(eslint.failAfterError());
}
function scripts() {
    return src(['./src/assets/js/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(plumber())
        // .pipe(webpackstream(webpackconfig, webpack))
        .pipe(concat('scripts.min.js'))
        .pipe(sourcemaps.write('./build/assets/js'))
        .pipe(dest('./build/assets/js'))
        .pipe(browsersync.stream())
}



function css() {
    return src('src/assets/styles/*.less')
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(less())
        // .pipe(postcss([autoprefixer(), cssnano()])) -- zet deze om in build
        .pipe(sourcemaps.write())
        .pipe(dest('build/assets/css'))
        .pipe(browsersync.stream());
}



//Concat and Compress Vendor .js files
// Deze moet nog bij o.a. watch komen.
// Main bower files ook nog?
function vendorjs(){
    return src(        [
        'src/assets/vendors/jquery/dist/jquery.js',
        'src/assets/vendors/**/*.js'
    ],{ sourcemaps: true })
        .pipe(uglify())
        .pipe(concat('vendorsjs.min.js'))
        .pipe(dest('build/assets/vendors', { sourcemaps: true }))
};

// gulp.task(vendorjs);

function vendorcss(){
    return src(['src/assets/vendors/**/*.css'])
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(concat('vendorscss.min.css'))
        .pipe(dest('build/assets/vendors', { sourcemaps: true }))
};

function clean() {
    return del(["./build/assets/**/*"]);
}



// Optimize Images
function images() {
    return gulp
        .src("src/assets/images/**")
        .pipe(newer("build/assets/images"))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [                        {
                            removeViewBox: false,
                            collapseGroups: true
                        }
                    ]
                })
            ])
        )
        .pipe(gulp.dest("./build/assets/images/"));
}
function vendimages() {
    return gulp
        .src("./src/assets/vendors/**/*.{JPG,jpg,png,gif}")
        .pipe(newer("./build/assets/vendors"))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [                        {
                        removeViewBox: false,
                        collapseGroups: true
                    }
                    ]
                })
            ])
        )
        .pipe(flatten())
        .pipe(gulp.dest("./build/assets/vendors/"));
}




function watchFiles() {
    gulp.watch("./src/assets/styles/**/*", css);
    gulp.watch("./src/assets/js/**/*", gulp.series(scriptsLint, scripts)); //geen linter nu
    gulp.watch(
        [
            "./src/*.html",
        ],
        gulp.series(htmldest,browserSyncReload)
    );
    gulp.watch("./src/assets/images/**/*", images);
}

// gulp.task(js);
// gulp.task(css);
// gulp.task(images);


//Desfine complex tasks
const vendors = series(updatevendors,parallel(vendorcss, vendorjs, vendimages));

const js = series(scriptsLint, scripts);

//const build = gulp.series(clean, gulp.parallel(css, images, scripts)); -- original
const build = series(clean, parallel(css, images, scripts, vendorcss, vendorjs, vendimages)); // -- custom
const watch = parallel(watchFiles, browserSync);

// Copy all js and html files, then inject paths to src html file, then copy src html to dist folder
const html =  series(clean,updatevendors,parallel(vendorcss,vendorjs,css,scripts,vendimages, images, series(injecthtml,htmldest)));


// export tasks
exports.vendors = vendors;
exports.html = html;

exports.images = images;
exports.vendimages = vendimages;
exports.css = css;
exports.js = js;

// Put together and minify / uglify all scripts in vendor folders
exports.vendorjs = vendorjs;

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;