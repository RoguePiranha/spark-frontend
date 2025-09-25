// vite.config.js
import { defineConfig } from 'vite';
import path from 'node:path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: '.',
  publicDir: false,
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        // Recreate your gulp concatenations/outputs
        core: path.resolve('assets/vendors/core/core.js'),         // -> dist/assets/vendors/core/core.js
        coreStyles: path.resolve('assets/vendors/core/core.css'),  // -> dist/assets/vendors/core/core.css
        style: path.resolve('assets/scss/style.scss')              // -> dist/assets/css/style.css
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'core') return 'assets/vendors/core/core.js';
          return 'assets/js/[name].js'; // any other JS entries (we only have 'core' here)
        },
        assetFileNames: (asset) => {
          // Map CSS emitted by the two CSS entries to your expected paths
          if (asset.name === 'coreStyles.css') return 'assets/vendors/core/core.css';
          if (asset.name === 'style.css')      return 'assets/css/style.css';

          // Fallback for other emitted assets (images/fonts discovered via url() in CSS, etc.)
          return 'assets/[name][extname]';
        }
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        // ---------- HTML ----------
        { src: 'index.html', dest: '.' },
        { src: 'pages/**/*', dest: 'pages' },
        // { src: 'partials/**/*', dest: 'partials' },

        // ---------- Top-level static (uncomment the ones you actually have) ----------
        // { src: '_redirects',  dest: '.' },
        // { src: '_headers',    dest: '.' },
        // { src: 'robots.txt',  dest: '.' },
        // { src: 'favicon.ico', dest: '.' },

        // ---------- Your own assets (EXCEPT vendors/core which we rebuild) ----------
        { src: ['assets/**', '!assets/vendors/**'], dest: '.' },

        // ---------- Vendor folders from node_modules (your old copyAddons) ----------
        { src: 'node_modules/@mdi/font/css/materialdesignicons.min.css', dest: 'assets/vendors/mdi/css' },
        { src: 'node_modules/@mdi/font/fonts/*',                        dest: 'assets/vendors/mdi/fonts' },

        { src: 'node_modules/@simonwep/pickr/dist/pickr.min.js',        dest: 'assets/vendors/pickr' },
        { src: 'node_modules/@simonwep/pickr/dist/themes/*',            dest: 'assets/vendors/pickr/themes' },

        { src: 'node_modules/ace-builds/src-min/**/*',                  dest: 'assets/vendors/ace-builds/src-min' },

        { src: 'node_modules/animate.css/animate.min.css',              dest: 'assets/vendors/animate.css' },

        { src: 'node_modules/apexcharts/dist/apexcharts.min.js',        dest: 'assets/vendors/apexcharts' },

        { src: 'node_modules/bootstrap-maxlength/dist/bootstrap-maxlength.min.js', dest: 'assets/vendors/bootstrap-maxlength' },

        { src: 'node_modules/chart.js/dist/chart.umd.js',               dest: 'assets/vendors/chartjs' },

        { src: 'node_modules/clipboard/dist/clipboard.min.js',          dest: 'assets/vendors/clipboard' },

        { src: 'node_modules/cropperjs/dist/cropper.min.css',           dest: 'assets/vendors/cropperjs' },
        { src: 'node_modules/cropperjs/dist/cropper.min.js',            dest: 'assets/vendors/cropperjs' },

        { src: 'node_modules/datatables.net/js/dataTables.js',          dest: 'assets/vendors/datatables.net' },
        { src: 'node_modules/datatables.net-bs5/css/dataTables.bootstrap5.css', dest: 'assets/vendors/datatables.net-bs5' },
        { src: 'node_modules/datatables.net-bs5/js/dataTables.bootstrap5.js',   dest: 'assets/vendors/datatables.net-bs5' },

        { src: 'node_modules/dropify/dist/css/dropify.min.css',         dest: 'assets/vendors/dropify/dist' },
        { src: 'node_modules/dropify/dist/js/dropify.min.js',           dest: 'assets/vendors/dropify/dist' },
        { src: 'node_modules/dropify/dist/fonts/*',                     dest: 'assets/vendors/dropify/fonts' },

        { src: 'node_modules/dropzone/dist/dropzone.css',               dest: 'assets/vendors/dropzone' },
        { src: 'node_modules/dropzone/dist/dropzone-min.js',            dest: 'assets/vendors/dropzone' },

        { src: 'node_modules/easymde/dist/easymde.min.css',             dest: 'assets/vendors/easymde' },
        { src: 'node_modules/easymde/dist/easymde.min.js',              dest: 'assets/vendors/easymde' },

        { src: 'node_modules/feather-icons/dist/*',                     dest: 'assets/vendors/feather-icons' },

        { src: 'node_modules/flag-icons/css/flag-icons.min.css',        dest: 'assets/vendors/flag-icons/css' },
        { src: 'node_modules/flag-icons/flags/**/*',                    dest: 'assets/vendors/flag-icons/flags' },

        { src: 'node_modules/flatpickr/dist/flatpickr.min.css',         dest: 'assets/vendors/flatpickr' },
        { src: 'node_modules/flatpickr/dist/flatpickr.min.js',          dest: 'assets/vendors/flatpickr' },

        { src: 'node_modules/font-awesome/css/font-awesome.min.css',    dest: 'assets/vendors/font-awesome/css' },
        { src: 'node_modules/font-awesome/fonts/*',                     dest: 'assets/vendors/font-awesome/fonts' },

        { src: 'node_modules/fullcalendar/index.global.min.js',         dest: 'assets/vendors/fullcalendar' },

        { src: 'node_modules/inputmask/dist/jquery.inputmask.min.js',   dest: 'assets/vendors/inputmask' },

        { src: 'node_modules/jquery/dist/jquery.min.js',                dest: 'assets/vendors/jquery' },

        { src: 'node_modules/jquery-mousewheel/jquery.mousewheel.js',   dest: 'assets/vendors/jquery-mousewheel' },

        { src: 'node_modules/jquery-sparkline/jquery.sparkline.min.js', dest: 'assets/vendors/jquery-sparkline' },

        { src: 'node_modules/jquery-steps/demo/css/jquery.steps.css',   dest: 'assets/vendors/jquery-steps' },
        { src: 'node_modules/jquery-steps/build/jquery.steps.min.js',   dest: 'assets/vendors/jquery-steps' },

        { src: 'node_modules/jquery-tags-input/dist/*',                 dest: 'assets/vendors/jquery-tags-input' },

        { src: 'node_modules/jquery-validation/dist/jquery.validate.min.js', dest: 'assets/vendors/jquery-validation' },

        { src: 'node_modules/jquery.flot/jquery.flot.js',               dest: 'assets/vendors/jquery.flot' },
        { src: 'node_modules/jquery.flot/jquery.flot.resize.js',        dest: 'assets/vendors/jquery.flot' },
        { src: 'node_modules/jquery.flot/jquery.flot.pie.js',           dest: 'assets/vendors/jquery.flot' },
        { src: 'node_modules/jquery.flot/jquery.flot.categories.js',    dest: 'assets/vendors/jquery.flot' },

        { src: 'node_modules/moment/min/moment.min.js',                 dest: 'assets/vendors/moment' },

        { src: 'node_modules/owl.carousel/dist/assets/owl.carousel.min.css',     dest: 'assets/vendors/owl.carousel' },
        { src: 'node_modules/owl.carousel/dist/assets/owl.theme.default.min.css',dest: 'assets/vendors/owl.carousel' },
        { src: 'node_modules/owl.carousel/dist/owl.carousel.min.js',             dest: 'assets/vendors/owl.carousel' },

        { src: 'node_modules/peity/jquery.peity.min.js',                dest: 'assets/vendors/peity' },

        { src: 'node_modules/prismjs/prism.js',                         dest: 'assets/vendors/prismjs' },
        { src: 'node_modules/prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.min.js', dest: 'assets/vendors/prismjs/plugins' },
        { src: 'node_modules/prismjs/themes/*',                         dest: 'assets/vendors/prismjs/themes' },

        { src: 'node_modules/select2/dist/css/select2.min.css',         dest: 'assets/vendors/select2' },
        { src: 'node_modules/select2/dist/js/select2.min.js',           dest: 'assets/vendors/select2' },

        { src: 'node_modules/sortablejs/Sortable.min.js',               dest: 'assets/vendors/sortablejs' },

        { src: 'node_modules/sweetalert2/dist/sweetalert2.min.css',     dest: 'assets/vendors/sweetalert2' },
        { src: 'node_modules/sweetalert2/dist/sweetalert2.min.js',      dest: 'assets/vendors/sweetalert2' },

        { src: 'node_modules/tinymce/**/*',                             dest: 'assets/vendors/tinymce' },

        { src: 'node_modules/typeahead.js/dist/typeahead.bundle.min.js',dest: 'assets/vendors/typeahead.js' }
      ]
    })
  ],
  server: { port: 5173 }
});
