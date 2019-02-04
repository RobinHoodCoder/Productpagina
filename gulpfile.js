"use strict";

const { src, dest, parallel, series } = require('gulp');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const inject = require('gulp-inject');
// const pug = require('gulp-pug');

const postcss = require("gulp-postcss");

const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const browsersync = require("browser-sync").create();
// const minifyCSS = require('gulp-minify-css');
const cssnano = require("cssnano");
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const plumber = require("gulp-plumber");
const eslint = require("gulp-eslint");
const del = require("del");


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

//Copy html to build map
function htmldest() {
    return src("./src/**/*.html")
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('./build/'));
}




// Lint scripts
function scriptsLint() {
    return gulp
        .src(["./src/assets/js/**/*", "./gulpfile.js"])
        .pipe(plumber())
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}
function css() {
    return src('src/assets/styles/*.less')
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(less())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write())
        .pipe(dest('build/assets/css'))
        .pipe(browsersync.stream());
}

function scripts() {
    return src('src/assets/js/*.js', { sourcemaps: true })
        .pipe(concat('scripts.min.js'))
        .pipe(dest('build/assets/js', { sourcemaps: true }))
}

//Concat and Compress Vendor .js files
// Deze moet nog bij o.a. watch komen.
// Main bower files ook nog?
function vendorjs(){
    return src(        [
        'src/assets/vendors/jquery/dist/jquery.js',
        'src/assets/vendors/**/*.js'
    ],{ sourcemaps: true })
        .pipe(concat('vendorsjs.min.js'))
        .pipe(dest('build/assets/vendors', { sourcemaps: true }))
};
function vendorcss(){
    return src(['src/assets/vendors/**/*.css'])
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(concat('vendorscss.min.css'))
        .pipe(dest('build/assets/vendors', { sourcemaps: true }))
};


function clean() {
    return del(["./build/assets/"]);
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

function watchFiles() {
    gulp.watch("./src/assets/styles/**/*", css);
    gulp.watch("./src/assets/js/**/*", gulp.series(scriptsLint, scripts));
    gulp.watch(
        [
            "./src/*.html",
        ],
        gulp.series(htmldest,browserSyncReload)
    );
    gulp.watch("./assets/images/**/*", images);
}

// gulp.task(js);
// gulp.task(css);
// gulp.task(images);


//Desfine complex tasks
const vendors = parallel(vendorcss, vendorjs);

const js = series(scriptsLint, scripts);
//const build = gulp.series(clean, gulp.parallel(css, images, scripts)); -- original


const build = series(clean, parallel(css, images, scripts, vendorcss, vendorjs)); // -- custom
const watch = parallel(watchFiles, browserSync);

// Copy all js and html files, then inject paths to src html file, then copy src html to dist folder
const html = series(vendorcss,vendorjs,scripts,injecthtml,htmldest);


// export tasks
exports.vendors = vendors;
exports.html = html;

exports.images = images;
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;