const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');
const ArchivePlugin = require('webpack-archive-plugin');


module.exports = function(grunt) {
  grunt.initConfig({

    webpack: {
      options: webpackConfig,
      dev: { devtool: 'sourcemap' },
      assets: {
        plugins: webpackConfig.plugins.concat(
          new ArchivePlugin({ output: 'dist', format: 'tar' })
        )
      },
      prod: {
        plugins: webpackConfig.plugins.concat(
          new webpack.DefinePlugin({ 'process.env': { NODE_ENV: 'production' } }),
          new webpack.optimize.UglifyJsPlugin()
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
        files: ['app/assets/**/*', '!app/assets/sass/**', '!app/assets/javascripts/**'],
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
