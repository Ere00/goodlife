const webpack = require('webpack');
const join = require('path').join;
const resolve = require('path').resolve;
const merge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');

const PATHS = {
  src: resolve('./src/webpack'),
  build: resolve('./theme/webpack')
};

const common = merge(require('./lib/plonetheme.webpack/webpack.globals'), {
  // Define bundles
  entry: {
    'anonymous': join(PATHS.src, 'anonymous'),
    'authenticated': join(PATHS.src, 'authenticated')
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: PATHS.build
  },
  module: {
    exprContextCritical: false,  // structure pattern has dynamic requires
    loaders: [
      { test: /\.jsx?$/, loaders: ['babel?cacheDirectory'], include: PATHS.src },
      { test: require.resolve('jquery'), loader: 'expose?$!expose?jQuery' }
    ]
  },
  plugins: [
    // Copy themes
    new CopyWebpackPlugin(
      [{ from: join(PATHS.src, '..'), to: '..' }],
      { ignore: ['**/webpack/*.js', '**/webpack/*.less',  '**/webpack/*.jsx',
                 'manifest.cfg',
                 'index.html',
                 'stressi.html',
                 'plugins.html',
                 'omakansio.html'
      ]}
    ),
    // Inject bundles
    new HtmlWebpackPlugin({
      filename: 'manifest.cfg',
      template: join(PATHS.src, 'manifest.cfg'),
      chunksSortMode: function(a, b) {
        return a.names[0] > b.names[0] ? 1 : -1;
      },
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: join(PATHS.src, 'index.html'),
      chunksSortMode: function(a, b) {
        return a.names[0] > b.names[0] ? 1 : -1;
      },
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'stressi.html',
      template: join(PATHS.src, 'stressi.html'),
      chunksSortMode: function(a, b) {
        return a.names[0] > b.names[0] ? 1 : -1;
      },
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'omakansio.html',
      template: join(PATHS.src, 'omakansio.html'),
      chunksSortMode: function(a, b) {
        return a.names[0] > b.names[0] ? 1 : -1;
      },
      inject: false
    }),
    new HtmlWebpackPlugin({
      filename: 'plugins.html',
      template: join(PATHS.src, 'plugins.html'),
      chunksSortMode: function(a, b) {
        return a.names[0] > b.names[0] ? 1 : -1;
      },
      inject: false
    })
  ]
});

const TARGET = process.env.TARGET || process.env.NODE_ENV;

if(TARGET === 'build' || !TARGET) {
  module.exports = merge(common, {
    output: {
      filename: '[name].[chunkhash].js',
      chunkFilename: '[chunkhash].js',
      publicPath: process.env.PUBLIC_PATH || '/Plone/++theme++webpack/'
    },
    resolve: {
      alias: {
        'react': 'react-lite',
        'react-dom': 'react-lite'
      }
    },
    module: {
      loaders: [
        { test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css') },
        { test: /\.less$/,
          loader: ExtractTextPlugin.extract('style', 'css!less') },
        { test: /\.scss$/,
          loader: ExtractTextPlugin.extract('style', 'css!sass') }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new ExtractTextPlugin('[name].[chunkhash].css'),
      new ExtractTextPlugin('[name].css'),
      new webpack.optimize.CommonsChunkPlugin(
        '__init__.' + (new Date()).getTime() + '.js'),
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
      })
    ]
  });
}

if(TARGET === 'watch') {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      hot: true,
      inline: true,
      progress: true,
      stats: 'errors-only',
      outputPath: PATHS.build,
      host: 'localhost',
      port: '8090'
    },
    module: {
      loaders: [
        { test: /\.css$/,
          loaders: ['style', 'css'] },
        { test: /\.less$/,
          loaders: ['style', 'css', 'less'] },
        { test: /\.scss$/,
          loaders: ['style', 'css', 'sass'] }
      ]
    },
    entry: join(PATHS.src, 'authenticated'),
    output: {
      filename: 'bundle.js',
      publicPath: 'http://localhost:8090/assets/'
    },
    plugins: [
      new WriteFileWebpackPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}
