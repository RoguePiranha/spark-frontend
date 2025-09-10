// import gulp from 'gulp';

// import { create as bsCreate } from 'browser-sync';
// const browserSync = bsCreate();

// import fs from 'node:fs';
// import * as dartSass from 'sass';
// import gulpSass from 'gulp-sass';
// const sass = gulpSass(dartSass);

// import path from 'node:path';
// import sourcemaps from 'gulp-sourcemaps';
// import inject from 'gulp-inject';
// import injectPartials from 'gulp-inject-partials';
// import replace from 'gulp-replace';
// import { deleteAsync } from 'del';
// import concat from 'gulp-concat';
// import merge from 'merge-stream';
// import rename from 'gulp-rename';
// import cleanCSS from 'gulp-clean-css';

// const DIST = 'dist';

// import plumber from 'gulp-plumber';

// function onErr(err) {
//     console.error(err?.message || err);
//     // @ts-ignore
//     this && this.emit && this.emit('end');
// }

// // const srcOpts = { allowEmpty: true }; // don’t crash on an empty glob
// // const copy = (globs, dest) =>
// //     gulp.src(globs, srcOpts)
// //         .pipe(plumber({ errorHandler: onErr }))
// //         .pipe(gulp.dest(dest));



// // gulp.task('html', function () {
// //   return gulp.src([
// //       'pages/**/*.html',
// //       '!pages/partials/**' // don't output the partials themselves
// //     ])
// //     .pipe(injectPartials({
// //       removeTags: true,
// //       basePath: (file) => path.resolve(__dirname, 'pages') // <— key line
// //     }))
// //     .pipe(gulp.dest('dist'));
// // });

// /** -----------------------------------------
//  *  Styles
//  *  ----------------------------------------- */
// gulp.task('sass', (done) => {
//     const scssEntry = 'assets/scss/style.scss';
//     if (!fs.existsSync(scssEntry)) {
//         console.log('[sass] No assets/scss/style.scss found — skipping Sass.');
//         return done();
//     }

//     return gulp.src(scssEntry)
//         .pipe(plumber(err => { console.error(err?.message || err); }))
//         .pipe(sourcemaps.init())
//         .pipe(sass({ includePaths: ['node_modules'] }).on('error', sass.logError))
//         .pipe(cleanCSS({ compatibility: 'ie8' }))
//         .pipe(sourcemaps.write('./'))
//         .pipe(gulp.dest('assets/css'))
//         .pipe(browserSync.stream());
// });


// /** -----------------------------------------
//  *  Partials + asset injection
//  *  ----------------------------------------- */
// // gulp.task('injectPartials', () => {
// //     const PARTIALS_ROOT = path.resolve('pages/partials');

// //     return gulp.src(['index.html', 'pages/**/*.html'], { base: './' })
// //         .pipe(replace(/<!--\s*partial:\s*partials\//g, function (match, ...args) {
// //             // `this.file` is available in gulp-replace’s function form
// //             const fileDir = path.dirname(this.file.path);
// //             const relToPartials = path
// //                 .relative(fileDir, PARTIALS_ROOT)
// //                 .replace(/\\/g, '/'); // fix Windows slashes
// //             return `<!-- partial:${relToPartials}/`;
// //         }))
// //         .pipe(injectPartials({ removeTags: true }))
// //         .pipe(gulp.dest('.'));
// // });

// // If you ever need to rewrite paths post-inject, add rules here.
// // Currently your structure uses direct /assets/* references, so we keep this a no-op.
// // gulp.task('replacePaths', (done) => done());

// // gulp.task('injectCommonAssets', () => {
// //     return gulp.src(['index.html', 'pages/**/*.html', '!node_modules/**/*.html', '!assets/**/*.html'])
// //         // Core bundle (css+js)
// //         .pipe(inject(gulp.src(['assets/vendors/core/core.css', 'assets/vendors/core/core.js'], { read: false }), {
// //             name: 'core', relative: true
// //         }))
// //         // Color mode toggle
// //         .pipe(inject(gulp.src(['assets/js/color-modes.js'], { read: false }), {
// //             name: 'color-modes', relative: true
// //         }))
// //         // Feather + app + feather font css
// //         .pipe(inject(gulp.src([
// //             'assets/vendors/feather-icons/feather.min.js',
// //             'assets/js/app.js',
// //             'assets/fonts/feather-font/css/iconfont.css'
// //         ], { read: false }), { relative: true }))
// //         .pipe(gulp.dest('.'));
// // });

// // removed "'injectPartials', " and ", 'injectCommonAssets'"
// // gulp.task('inject', gulp.series('replacePaths'));

// /** -----------------------------------------
//  *  Vendors
//  *  ----------------------------------------- */
// // gulp.task('cleanVendors', () => deleteAsync(['assets/vendors/**/*']));

// // gulp.task('buildCoreCss', () => {
// //     return gulp.src(['node_modules/perfect-scrollbar/css/perfect-scrollbar.css'])
// //         .pipe(cleanCSS({ compatibility: 'ie8' }))
// //         .pipe(concat('core.css'))
// //         .pipe(gulp.dest('assets/vendors/core'));
// // });

// // gulp.task('buildCoreJs', () => {
// //     return gulp.src([
// //         'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
// //         'node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js',
// //     ], { allowEmpty: true })
// //         .pipe(plumber({ errorHandler: onErr }))
// //         .pipe(concat('core.js'))
// //         .pipe(gulp.dest('assets/vendors/core'));
// // });

// // gulp.task('copyAddons', () => {
// //     const tasks = [
// //         copy('node_modules/@mdi/font/css/materialdesignicons.min.css', 'assets/vendors/mdi/css'),
// //         copy('node_modules/@mdi/font/fonts/*', 'assets/vendors/mdi/fonts'),
// //         copy('node_modules/@simonwep/pickr/dist/pickr.min.js', 'assets/vendors/pickr'),
// //         copy('node_modules/@simonwep/pickr/dist/themes/*', 'assets/vendors/pickr/themes'),
// //         copy('node_modules/ace-builds/src-min/**/*', 'assets/vendors/ace-builds/src-min'),
// //         copy('node_modules/animate.css/animate.min.css', 'assets/vendors/animate.css'),
// //         copy('node_modules/apexcharts/dist/apexcharts.min.js', 'assets/vendors/apexcharts'),
// //         copy('node_modules/bootstrap-maxlength/dist/bootstrap-maxlength.min.js', 'assets/vendors/bootstrap-maxlength'),
// //         copy('node_modules/chart.js/dist/chart.umd.js', 'assets/vendors/chartjs'),
// //         copy('node_modules/clipboard/dist/clipboard.min.js', 'assets/vendors/clipboard'),
// //         copy(['node_modules/cropperjs/dist/cropper.min.css', 'node_modules/cropperjs/dist/cropper.min.js'], 'assets/vendors/cropperjs'),
// //         copy('node_modules/datatables.net/js/dataTables.js', 'assets/vendors/datatables.net'),
// //         copy(['node_modules/datatables.net-bs5/css/dataTables.bootstrap5.css', 'node_modules/datatables.net-bs5/js/dataTables.bootstrap5.js'], 'assets/vendors/datatables.net-bs5'),
// //         copy(['node_modules/dropify/dist/css/dropify.min.css', 'node_modules/dropify/dist/js/dropify.min.js'], 'assets/vendors/dropify/dist'),
// //         copy('node_modules/dropify/dist/fonts/*', 'assets/vendors/dropify/fonts'),
// //         copy(['node_modules/dropzone/dist/dropzone.css', 'node_modules/dropzone/dist/dropzone-min.js'], 'assets/vendors/dropzone'),
// //         copy(['node_modules/easymde/dist/easymde.min.css', 'node_modules/easymde/dist/easymde.min.js'], 'assets/vendors/easymde'),
// //         copy('node_modules/feather-icons/dist/*', 'assets/vendors/feather-icons'),
// //         copy('node_modules/flag-icons/css/flag-icons.min.css', 'assets/vendors/flag-icons/css'),
// //         copy('node_modules/flag-icons/flags/**/*', 'assets/vendors/flag-icons/flags'),
// //         copy(['node_modules/flatpickr/dist/flatpickr.min.css', 'node_modules/flatpickr/dist/flatpickr.min.js'], 'assets/vendors/flatpickr'),
// //         copy('node_modules/font-awesome/css/font-awesome.min.css', 'assets/vendors/font-awesome/css'),
// //         copy('node_modules/font-awesome/fonts/*', 'assets/vendors/font-awesome/fonts'),
// //         copy('node_modules/fullcalendar/index.global.min.js', 'assets/vendors/fullcalendar'),
// //         copy('node_modules/inputmask/dist/jquery.inputmask.min.js', 'assets/vendors/inputmask'),
// //         copy('node_modules/jquery/dist/jquery.min.js', 'assets/vendors/jquery'),
// //         copy('node_modules/jquery-mousewheel/jquery.mousewheel.js', 'assets/vendors/jquery-mousewheel'),
// //         copy('node_modules/jquery-sparkline/jquery.sparkline.min.js', 'assets/vendors/jquery-sparkline'),
// //         copy(['node_modules/jquery-steps/demo/css/jquery.steps.css', 'node_modules/jquery-steps/build/jquery.steps.min.js'], 'assets/vendors/jquery-steps'),
// //         copy('node_modules/jquery-tags-input/dist/*', 'assets/vendors/jquery-tags-input'),
// //         copy('node_modules/jquery-validation/dist/jquery.validate.min.js', 'assets/vendors/jquery-validation'),
// //         copy(['node_modules/jquery.flot/jquery.flot.js', 'node_modules/jquery.flot/jquery.flot.resize.js', 'node_modules/jquery.flot/jquery.flot.pie.js', 'node_modules/jquery.flot/jquery.flot.categories.js'], 'assets/vendors/jquery.flot'),
// //         copy('node_modules/moment/min/moment.min.js', 'assets/vendors/moment'),
// //         copy(['node_modules/owl.carousel/dist/assets/owl.carousel.min.css', 'node_modules/owl.carousel/dist/assets/owl.theme.default.min.css', 'node_modules/owl.carousel/dist/owl.carousel.min.js'], 'assets/vendors/owl.carousel'),
// //         copy('node_modules/peity/jquery.peity.min.js', 'assets/vendors/peity'),
// //         copy('node_modules/prismjs/prism.js', 'assets/vendors/prismjs'),
// //         copy('node_modules/prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js', 'assets/vendors/prismjs/plugins'),
// //         copy('node_modules/prismjs/themes/*', 'assets/vendors/prismjs/themes'),
// //         copy(['node_modules/select2/dist/css/select2.min.css', 'node_modules/select2/dist/js/select2.min.js'], 'assets/vendors/select2'),
// //         copy('node_modules/sortablejs/Sortable.min.js', 'assets/vendors/sortablejs'),
// //         copy(['node_modules/sweetalert2/dist/sweetalert2.min.css', 'node_modules/sweetalert2/dist/sweetalert2.min.js'], 'assets/vendors/sweetalert2'),
// //         copy('node_modules/tinymce/**/*', 'assets/vendors/tinymce'),
// //         copy('node_modules/typeahead.js/dist/typeahead.bundle.min.js', 'assets/vendors/typeahead.js'),
// //     ];

// //     return merge(...tasks);
// // });

// // gulp.task('copyVendors', gulp.series('cleanVendors', 'buildCoreCss', 'buildCoreJs', 'copyAddons'));

// /** -----------------------------------------
//  *  Build to /dist for Cloudflare Pages
//  *  ----------------------------------------- */
// gulp.task('clean:dist', () => deleteAsync([`${DIST}/**/*`]));

// gulp.task('copy:html', () =>
//     gulp.src(['index.html', 'pages/**/*.html', '!node_modules/**', '!dist/**'], { base: '.' })
//         .pipe(gulp.dest(DIST))
// );

// gulp.task('copy:partials', () =>
//     gulp.src(['partials/**/*.html'], { base: '.' })
//         .pipe(gulp.dest(DIST))
// );

// gulp.task('copy:assets', () =>
//     gulp.src(['assets/**/*'], { base: '.' })
//         .pipe(gulp.dest(DIST))
// );

// gulp.task('copy:static', () =>
//     gulp.src(['_redirects', '_headers', 'robots.txt', 'favicon.ico'].map(p => `./${p}`), { allowEmpty: true })
//         .pipe(gulp.dest(DIST))
// );

// gulp.task('build', gulp.series(
//     // 'copyVendors',
//     'sass',
//     // 'inject',
//     'clean:dist',
//     gulp.parallel('copy:html', 'copy:assets', 'copy:static')
// )); // 'copy:partials',

// /** Default */
// gulp.task('default');
