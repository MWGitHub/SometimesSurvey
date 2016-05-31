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
  devtool: 'source-map',
  entry: ['./index'],
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    library: 'survey-component',
    libraryTarget: 'commonjs2',
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
    new ExtractTextPlugin(path.join('..', 'index.css')),
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
