const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin') // installed via npm
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const webpack = require('webpack')

const nodeEnv = process.env.NODE_ENV || 'development'
// const isProd = nodeEnv === 'production';

module.exports = {
  entry: './main.js',
  target: 'node',
  externals: [
    function (context, request, callback) {
      if (/^electron$/.test(request)) {
        return callback(null, 'commonjs ' + request)
      }
      callback()
    }
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new CopyWebpackPlugin([
      // Ignore some files using glob in nested directory
      {
        from: './electron/*.html',
        to: './[name].html'
      },
      {
        from: './electron/resource',
        to: './resource'
      },
      {
        from: './openProxy.js',
        to: './'
      },
      {
        from: './package.json',
        to: './'
      },
      {
        from: './MiniProxy.js',
        to: './'
      },
      {
        from: './pac',
        to: './'
      }
      // {
      //   from: {glob: './electron/script/*.+(sh|bat)'},
      //   to: './script/[name].[ext]'
      // }
    ], {
      ignore: [
        // Doesn't copy any files with a txt extension
        // '*.txt',

        // Doesn't copy any file, even if they start with a dot
        // '**/*',

        // Doesn't copy any file, except if they start with a dot
        // { glob: '**/*', dot: false }
      ]

      // By default, we only copy modified files during
      // a watch or webpack-dev-server build. Setting this
      // to `true` copies all files.
      // copyUnmodified: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      'buildByWebpack': JSON.stringify(true)
    }),
    new UglifyJsPlugin()
  ]
}
