var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: ['./example/main'],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'example'),
    publicPath: '/example/',
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ },
    ],
  },
};
