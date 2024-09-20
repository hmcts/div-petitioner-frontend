const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ArchivePlugin = require('webpack-archive-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const miniCssExtract = new MiniCssExtractPlugin({
  filename: 'stylesheets/application.css',
  chunkFilename: '[id].css'
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
    path: path.resolve(__dirname, './public/[fullhash]'),
    filename: 'javascripts/bundle--[name].js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      'window.$': 'jquery',
      'window.jQuery': 'jquery',
      $: 'jquery',
      jQuery: 'jquery'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './tmp/images', to: 'images' }
      ]
    }),
    miniCssExtract,
    function() {
      this.hooks.done.tap('ManifestPlugin', stats => {
        fs.writeFileSync(
          path.join(__dirname, 'manifest.json'),
          JSON.stringify({ STATIC_ASSET_PATH: stats.hash })
        );
      });
    }
  ],
  optimization: {
    minimize: true
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [
                  'node_modules/govuk-frontend'
                ]
              }
            }
          }
        ]
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
      {
        test: /public/,
        use: [
          { loader: 'imports-loader', options: { imports: 'default this=>window' } },
          { loader: 'imports-loader', options: { imports: 'default $=jquery' } }
        ]
      }
    ]
  }
};
