const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const {
  DllReferencePlugin,
  ProvidePlugin,
  ProgressPlugin
} = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

const isDevelopment = !(process.env.NODE_ENV === 'production');
const devtool = isDevelopment
  ? process.env.USE_SOURCE_MAP
    ? 'eval-cheap-source-map'
    : 'eval'
  : undefined;

const output = {
  path: path.resolve(__dirname, 'dist'),
  filename: isDevelopment ? '[name].js' : '[name].[contenthash:8].js',
  publicPath: '/'
};

const htmlWebpackPluginOptions = {
  inject: true,
  template: path.resolve(__dirname, 'public', 'index.html'),
  vendor: null
};

const plugins = [
  isDevelopment &&
    new ReactRefreshWebpackPlugin({
      overlay: false
    }),
  isDevelopment &&
    new ProvidePlugin({
      React: 'react'
    }),
  new ProgressPlugin(),
  ,
].filter(Boolean);

// with vendor dll reference, the build time will be reduce a lots
if (isDevelopment) {
  const vendorManifest = path.join(__dirname, 'build', 'vendor-manifest.json');
  // if use vendor build
  if (!fs.existsSync(vendorManifest)) {
    execSync('node_modules/.bin/webpack --config webpack.vendor.config', {
      stdio: 'inherit',
      env: process.env,
      cwd: process.cwd()
    });
  }
  plugins.push(
    new DllReferencePlugin({
      context: __dirname,
      manifest: vendorManifest
    })
  );
  htmlWebpackPluginOptions.vendor = '/vendor.bundle.js';
}

plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginOptions));

const optimizer = {};

if (process.env.NODE_ENV === 'production') {
  optimizer.minimize = true;
  optimizer.minimizer = [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    })
  ];
}

module.exports = {
  stats: {
    preset: 'minimal'
  },
  experiments: {
    cacheUnaffected: true,
    lazyCompilation: {
      entries: false,
      imports: isDevelopment && process.env.DISABLED_LAZY !== 'true'
    }
  },
  watchOptions: {
    aggregateTimeout: 100, // immediately
    ignored: ['node_modules', 'dist', 'build']
  },
  devtool: devtool,
  mode: process.env.NODE_ENV || 'development',
  devServer: {
    hot: true,
    liveReload: false,
    https: false,
    historyApiFallback: true,
    static: [
      path.resolve(__dirname, 'public'),
      path.resolve(__dirname, 'build')
    ],
    // for ngrok tunneling
    allowedHosts: 'all'
  },
  entry: ['./src/index.js'],
  output: output,
  plugins: plugins,
  optimization: optimizer,
  target: 'web',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',

          {
            loader: 'css-loader',
            options: {
              esModule: false
              //sourceMap: isDevelopment
            }
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 2,
              esModule: false,
              modules: {
                compileType: 'module',
                mode: 'local',
                auto: true,
                namedExport: false,
                localIdentName: '[hash:base64:5]'
              }

              //sourceMap: isDevelopment
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              additionalData: `@import 'src/themes/default/colors';`,
              implementation: require('node-sass')
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        include: /images/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
              // development need proxy
              publicPath: '/images/'
            }
          }
        ]
      },
      {
        test: /\.(webm|mov)$/i,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 200000,
              encoding: 'base64'
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              ref: true,
              svgoConfig: {
                plugins: {
                  removeViewBox: false
                }
              }
            }
          }
        ]
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2020',
          minify: false
        }
      },
      {
        test: /\.xml$/,
        exclude: /node_modules/,
        loader: 'url-loader'
      }
    ]
  }
};
