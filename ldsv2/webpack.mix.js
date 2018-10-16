const mix = require('laravel-mix');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const Dotenv = require('dotenv-webpack');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for your application, as well as bundling up your JS files.
 |
 */

mix.autoload({
    'jquery': ['$', 'jQuery'],
});

mix.js('assets/js/app.js', 'dist/js')
   .sass('assets/scss/app.scss', 'dist/css')
   .sass('assets/scss/theme/bright.scss', 'dist/css/bright.css')
   .sass('assets/scss/theme/clean.scss', 'dist/css/clean.css')
   .sass('assets/scss/theme/dark.scss', 'dist/css/dark.css')
   .sass('assets/scss/theme/flat.scss', 'dist/css/flat.css')
   .sass('assets/scss/theme/muted.scss', 'dist/css/muted.css')
   .sass('assets/scss/theme/standard.scss', 'dist/css/standard.css')
   .react('assets/react/design_entry.js', 'dist/js/design.js')
   .react('assets/react/front_entry.js', 'dist/js/front.js')
   .extract([
       'alertify.js',
       'axios',
       'babel-polyfill',
       'bootstrap-toggle',
       'classnames',
       'clipboard',
       'd3',
       'eonasdan-bootstrap-datetimepicker',
       'graphlib',
       'gravatar',
       'history',
       'jquery',
       'jquery-bootstrap-scrolling-tabs',
       'jquery-mousewheel',
       'jsplumb',
       'js-cookie',
       'lib/bootstrap/js/scrollhspy',
       'lib/jquery.panzoom',
       'lib/jquery-resizable-dom/dist/jquery-resizable',
       'lodash',
       'masonry-layout',
       'md5',
       'moment',
       'multi-clamp',
       'prop-types',
       'rc-animate',
       'react',
       'react-dnd',
       'react-dnd-html5-backend',
       'react-dnd-touch-backend',
       'react-dom',
       'react-dropzone',
       'react-redux',
       'react-router-dom',
       'react-router-redux',
       'redux',
       'redux-axios-middleware',
       'redux-observable',
       'redux-thunk',
       'rxjs',
       'selectize',
       'select2',
       'socket.io-client',
       'textcomplete',
       'tree-model',
       'uuid',
       'validate.js',
   ])
   .setPublicPath('./')
   .version();

mix.webpackConfig({
    context: __dirname,
    resolve: {
        modules: ['./assets', 'node_modules'],
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    use: 'css-loader',
                    fallback: 'style-loader'
                })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename:  (getPath) => {
              return getPath('/css[name].css').replace('css/js', 'css');
            },
            allChunks: true
        }),

        new Dotenv({
            path: './.env',
        })
    ],
    node: {
       fs: 'empty'
    }
});


// Full API
// mix.js(src, output);
// mix.react(src, output); <-- Identical to mix.js(), but registers React Babel compilation.
// mix.extract(vendorLibs);
// mix.sass(src, output);
// mix.standaloneSass('src', output); <-- Faster, but isolated from Webpack.
// mix.fastSass('src', output); <-- Alias for mix.standaloneSass().
// mix.less(src, output);
// mix.stylus(src, output);
// mix.browserSync('my-site.dev');
// mix.combine(files, destination);
// mix.babel(files, destination); <-- Identical to mix.combine(), but also includes Babel compilation.
// mix.copy(from, to);
// mix.copyDirectory(fromDir, toDir);
// mix.minify(file);
// mix.sourceMaps(); // Enable sourcemaps
// mix.version(); // Enable versioning.
// mix.disableNotifications();
// mix.setPublicPath('path/to/public');
// mix.setResourceRoot('prefix/for/resource/locators');
// mix.autoload({}); <-- Will be passed to Webpack's ProvidePlugin.
// mix.webpackConfig({}); <-- Override webpack.config.js, without editing the file directly.
// mix.then(function () {}) <-- Will be triggered each time Webpack finishes building.
// mix.options({
//   extractVueStyles: false, // Extract .vue component styling to file, rather than inline.
//   processCssUrls: true, // Process/optimize relative stylesheet url()'s. Set to false, if you don't want them touched.
//   purifyCss: false, // Remove unused CSS selectors.
//   uglify: {}, // Uglify-specific options. https://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
//   postCss: [] // Post-CSS options: https://github.com/postcss/postcss/blob/master/docs/plugins.md
// });
