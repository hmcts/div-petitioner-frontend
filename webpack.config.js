'use strict';
const CONF = require('config');
const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const extractSass = new ExtractTextPlugin({
  filename: 'stylesheets/application.css',
  allChunks: true
});

module.exports = {
  target: 'node',
  entry: {
    common: [
      'jquery',
      './app/assets/javascripts/application.js',
      './app/assets/javascripts/cookiesManager.js',
      './app/assets/javascripts/disable-enable-button.js',
      './app/assets/javascripts/documentUpload.js',
      './app/assets/javascripts/dynamicFields.js',
      './app/assets/javascripts/validation.js',
      './app/assets/javascripts/webchat.js',
      './node_modules/dropzone/dist/dropzone.js',
      './node_modules/govuk_frontend_toolkit/javascripts/govuk/show-hide-content.js',
      './node_modules/jquery-migrate/dist/jquery-migrate.js'
    ],
    sitemap: './app/steps/sitemap/client.js',
    css: './tmp/sass/application.scss'
  },
  output: {
    path: path.resolve(__dirname, '/public/[hash]'),
    filename: 'javascripts/bundle--[name].js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      'window.$': 'jquery',
      'window.jQuery': 'jquery',
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new CopyWebpackPlugin([
      { from: './tmp/images', to: 'images' }
    ]),
    // new webpack.DefinePlugin({
      // Replace variable values of COOKIEDOMAIN in JS files with the value of CONF.cookieDomain (as a quoted str)
      // 'COOKIEDOMAIN': JSON.stringify(CONF.cookieDomain)
    // }),
    extractSass,
    function() {
      this.plugin('done', stats => {
        fs.writeFileSync(
          path.join(__dirname, 'manifest.json'),
          JSON.stringify({ STATIC_ASSET_PATH: stats.hash })
        );
      });
    }
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.uglifyJsMinify,
        // `terserOptions` options will be passed to `uglify-js`
        // Link to options - https://github.com/mishoo/UglifyJS#minify-options
        terserOptions: {},
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: extractSass.extract({
          use: [
            { loader: 'css-loader' },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [
                  'node_modules/govuk-frontend'
                ]
              }
            }
          ]
        })
      },
      {
        test: /\.(jpg|png|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: '../images/[name].[ext]' }
          }
        ]
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      { test: /public/, loader: 'imports-loader?this=>window' },
      { test: /public/, loader: 'imports-loader?$=jquery' }
    ]
  }
};
