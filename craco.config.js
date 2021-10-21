const webpackConfig = require('./webpack.config');

module.exports = {
  reactScriptsVersion: 'react-scripts' /* (default value) */,
  webpack: {
    configure: (config, { env }) => {
      /* Any webpack configuration options: https://webpack.js.org/configuration */
      return { ...config, ...webpackConfig };
    }
  },
  devServer: webpackConfig.devServer
};
