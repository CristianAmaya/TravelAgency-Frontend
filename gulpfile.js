import dotenv from "dotenv";
import gulp from "gulp";

/* PLUGIN GENERALES */
import sourcemaps from "gulp-sourcemaps";

/* PLUGIN HTML */
import fileinclude from "gulp-file-include";
import formatHtml from "gulp-format-html";
import removeEmptyLines from "gulp-remove-empty-lines";
import htmlmin from "gulp-htmlmin";

/* PLUGIN CSS */
import autoprefixer from "gulp-autoprefixer";
import cssnano from "gulp-cssnano";

/* PLUGIN JS */
import browserify from "browserify";
import source from "vinyl-source-stream";

/* PLUGIN WEB SERVER */
import connect from "gulp-connect";

dotenv.config();

const config = {
  env: {
    production: process.env.PRODUCTION,
    name: "TRAVEL AGENCY",
    port: process.env.PORT,
    root: `./${process.env.FOLDER_BUILD}`,
  },
  html: {
    src: ["./src/html/index.html"],
    watch: ["./src/html/**/*.html"],
    dest: `./${process.env.FOLDER_BUILD}`,
  },
  css: {
    src: ["./src/css/styles.css"],
    watch: ["./src/css/styles.css"],
    dest: `./${process.env.FOLDER_BUILD}`,
  },
  js: {
    src: ["./src/js/main.js"],
    watch: ["./src/js/**/*.js"],
    dest: `./${process.env.FOLDER_BUILD}`,
  },
  assets: {
    src: ["./src/assets/**/*"],
    watch: ["./src/assets/**/*"],
    dest: `./${process.env.FOLDER_BUILD}/assets`,
  },
};

function taskCompileHTML() {
  return gulp
    .src(config.html.src)
    .pipe(
      fileinclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(removeEmptyLines())
    .pipe(formatHtml())
    .pipe(
      htmlmin({
        collapseWhitespace: config.env.production,
        removeComments: config.env.production,
      })
    )
    .pipe(gulp.dest(config.html.dest))
    .pipe(connect.reload());
}

function taskCompileCSS() {
  return gulp
    .src(config.css.src)
    .pipe(sourcemaps.init())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(cssnano())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.css.dest))
    .pipe(connect.reload());
}

function taskCompileJS() {
  return browserify(config.js.src)
    .transform("babelify", {
      presets: ["@babel/preset-env"],
      plugins: ["@babel/plugin-transform-modules-commonjs"],
      ignore: ["node_modules"],
    })
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulp.dest(config.js.dest));
}

function assetsTransfer() {
  return gulp
    .src(config.assets.src)
    .pipe(gulp.dest(config.assets.dest))
    .pipe(connect.reload());
}

function connectLiveReload() {
  connect.server({
    name: config.env.name,
    root: config.env.root,
    livereload: true,
    port: config.env.port,
  });
}

function watchAndReload() {
  gulp.watch(config.html.watch, taskCompileHTML);
  gulp.watch(config.css.watch, taskCompileCSS);
  gulp.watch(config.js.watch, taskCompileJS);
  gulp.watch(config.assets.watch, assetsTransfer);
}

export default gulp.series(
  taskCompileHTML,
  taskCompileCSS,
  taskCompileJS,
  assetsTransfer,
  gulp.parallel(watchAndReload, connectLiveReload)
);
