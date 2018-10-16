
/**
 * As our first step, we'll pull in the user's webpack.mix.js
 * file. Based on what the user requests in that file,
 * a generic config object will be constructed for us.
 */

require('laravel-mix/src/index');
require(Mix.paths.mix());

/**
 * Just in case the user needs to hook into this point
 * in the build process, we'll make an announcement.
 */

Mix.dispatch('init', Mix);

/**
 * Now that we know which build tasks are required by the
 * user, we can dynamically create a configuration object
 * for Webpack. And that's all there is to it. Simple!
 */

let WebpackConfig = require('laravel-mix/src/builder/WebpackConfig');

let defaultConfig = new WebpackConfig().build();

// Override the fonts base directory
defaultConfig.module
             .rules
             .filter(t => String(t.test) == String(/\.(woff2?|ttf|eot|svg|otf)$/))
             .forEach(t => {
                 t.options.name = path => {
                     if (! /node_modules|bower_components/.test(path)) {
                         return 'dist/fonts/custom/[name].[ext]?[hash]';
                     }

                     return 'dist/fonts/vendor/' + path
                         .replace(/\\/g, '/')
                         .replace(
                             /((.*(node_modules|bower_components))|fonts|font|assets)\//g, ''
                         ) + '?[hash]';
                 };
                 t.options.publicPath = '../../';
             });

module.exports = defaultConfig;
