var path = require('path');
var webpack = require('webpack');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var atImport = require('postcss-import');
var postcssFor = require('postcss-for');
var math = require('postcss-math');
var cssVars = require('postcss-simple-vars');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['./lib/main'],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'static'),
    publicPath: '/static/',
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader!postcss-loader'
        ),
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: false,
    }),
    new ExtractTextPlugin('bundle.css'),
  ],
  postcss: function () {
    return [
      atImport,
      precss,
      autoprefixer,
      postcssFor,
      math,
      cssVars,
    ];
  },
};
