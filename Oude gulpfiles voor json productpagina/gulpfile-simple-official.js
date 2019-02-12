const { src, dest, parallel } = require('gulp');
// const pug = require('gulp-pug');
const less = require('gulp-less');
const browsersync = require("browser-sync").create();
const minifyCSS = require('gulp-minify-css');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

//
// function html() {
//     return src('client/templates/*.pug')
//         .pipe(pug())
//         .pipe(dest('build/html'))
// }

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./_site/"
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

function css() {
    return src('src/assets/styles/*.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(dest('build/assets/css'))
}

function js() {
    return src('src/assets/js/*.js', { sourcemaps: true })
        .pipe(concat('scripts.min.js'))
        .pipe(dest('build/assets/js', { sourcemaps: true }))
}

function clean() {
    return del(["./_site/assets/"]);
}

// Optimize Images
function images() {
    return gulp
        .src("./build/assets/images/**/*")
        .pipe(newer("./src/assets/images"))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        {
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
            "./src/**/*.html",
        ],
        gulp.series(browserSyncReload)
    );
    gulp.watch("./assets/img/**/*", images);
}

//Desfine complex tasks
const build = gulp.series(clean, gulp.parallel(css, images, jekyll, js));
const watch = gulp.parallel(watchFiles, browserSync);

exports.js = js;
exports.css = css;
exports.default = parallel(css, js);