const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')
const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.ts', 
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, "build/src/"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
        'fs': false,
        'readline': false,
        'path': require.resolve('path-browserify'),
        'stream': require.resolve('stream-browserify'),
        'util': require.resolve('util/'),
        "buffer": require.resolve("buffer/"),
        "assert": require.resolve("assert/"),
        "zlib": require.resolve("browserify-zlib"),
        "constants": require.resolve("constants-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "os": require.resolve("os-browserify/browser"),
      }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      favicon: './src/public/favicon.ico'
    }),
    new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    new CopyWebpackPlugin({
    patterns: [
        { from: './src/public', to: './build/src/public' },
     ],
    }),
  ],
  devServer: {
    static: {
        directory: path.join(__dirname, 'build/src/'),
      },
  },
};
