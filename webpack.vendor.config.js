const webpack = require('webpack');
const path = require('path');
const package = require('./package.json');

module.exports = {
  mode: 'development',
  target: 'web',
  entry: {
    vendor: Object.keys(package.dependencies).filter(
      (p) => p !== 'json-schema-to-typescript'
    )
  },
  output: {
    filename: 'vendor.bundle.js',
    path: path.join(__dirname, 'build'),
    library: 'vendor_lib'
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.DllPlugin({
      name: 'vendor_lib',
      path: path.join(__dirname, 'build', 'vendor-manifest.json')
    })
  ]
};
