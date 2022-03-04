const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const ArchivePlugin = require('webpack-archive-plugin');
const CONF = require("config");


module.exports = function(grunt) {
  grunt.initConfig({

    webpack: {
      options: webpackConfig,
      dev: {
        devtool: 'sourcemap',
        plugins: webpackConfig.plugins.concat(
          // Replace variable values of COOKIEDOMAIN in JS files with the value of CONF.cookieDomain (as a quoted str)
          new webpack.DefinePlugin({ 'COOKIEDOMAIN': JSON.stringify(CONF.cookieDomain) }),
        )
      },
      assets: {
        plugins: webpackConfig.plugins.concat(
          new ArchivePlugin({ output: 'dist', format: 'tar' })
        )
      },
      prod: {
        plugins: webpackConfig.plugins.concat(
          new webpack.DefinePlugin({ 'process.env': { NODE_ENV: 'production' } }),
          // Replace variable values of COOKIEDOMAIN in JS files with the value of CONF.cookieDomain (as a quoted str)
          new webpack.DefinePlugin({ 'COOKIEDOMAIN': JSON.stringify(CONF.cookieDomain) })
        )
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: 'app/assets/sass',
            src: '**',
            dest: 'tmp/sass/'
          },
          {
            expand: true,
            cwd: 'app/assets/images',
            src: '**',
            dest: 'tmp/images/'
          },
          {
            expand: true,
            cwd: 'app/assets/locale',
            src: '**',
            dest: 'tmp/locale/'
          }
        ]
      }
    },

    clean: ['tmp', 'public/images'],

    // Watches assets and sass for changes
    watch: {
      css: {
        files: ['app/assets/sass/**/*.scss'],
        tasks: ['webpack:dev'],
        options: { spawn: false }
      },
      assets: {
        files: ['app/assets/**/*', '!app/assets/sass/**', '!app/assets/javascripts/**', '!app/assets/locale/**'],
        tasks: ['webpack:dev'],
        options: { spawn: false }
      }
    },

    // nodemon watches for changes and restarts app
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          nodeArgs: ['--trace-warnings', '--inspect'],
          ext: 'js, json, yaml',
          ignore: ['node_modules/**', 'app/assets/**', 'public/**', 'functional-output/**', 'coverage/**', 'test/**'],
          args: grunt.option.flags()
        }
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: { logConcurrentOutput: true }
      }
    },
  });

  [
    'grunt-contrib-clean',
    'grunt-contrib-copy',
    'grunt-contrib-watch',
    'grunt-nodemon',
    'grunt-concurrent',
    'grunt-webpack'
  ].forEach(task => {
    grunt.loadNpmTasks(task);
  });

  grunt.registerTask('setup-assets', ['webpack:assets']);

  grunt.registerTask('setup-prod', [
    'copy',
    'webpack:prod',
    'clean'
  ]);

  grunt.registerTask('dev', [
    'copy',
    'webpack:dev',
    'clean',
    'concurrent:dev'
  ]);
};
