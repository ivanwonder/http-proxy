const {fork} = require('child_process')
const {_buildByWebpack} = require('../../utils/platform')
const {app} = require('electron')
const path = require('path')
const MyFile = require('./file')

const env = Object.assign({logPath: MyFile.path}, process.env)

var _ls = fork(path.join(_buildByWebpack ? app.getAppPath() : path.join(__dirname, '../'), './childprocess/deleteLogFile.js'), [], {
  env,
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
})

_ls.stdout.setEncoding('utf8').on('data', (data) => {
  console.log(data)
})
