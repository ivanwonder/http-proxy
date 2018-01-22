const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './main.js',
  target: 'node',
  externals: {
    electron: {
      commonjs: 'electron',
      amd: 'electron',
      root: '_' // indicates global variable
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  plugins: [
    new CopyWebpackPlugin([
      // Ignore some files using glob in nested directory
      {
        from: './tray',
        to: './tray',
        ignore: ['*.js']
      },
      {
        from: './*.html',
        to: './'
      },
      {
        from: './openProxy.js',
        to: './'
      },
      {
        from: './package.json',
        to: './'
      }
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
    })
  ]
}
