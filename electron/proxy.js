const {childProcess} = require('../utils/map')
const path = require('path')
const {app} = require('electron')
const {_isWindows, _buildByWebpack} = require('../utils/platform')
const fs = require('fs')
const MyFile = require('./file/file')

function openProxy (args, listen) {
  let _rej
  let _res
  let writeFile

  const _promise = new Promise((resolve, reject) => {
    _rej = reject
    _res = resolve
  })

  const id = new Date().getTime()

  const fork = require('child_process').fork
  const _ls = fork(path.join(_buildByWebpack ? app.getAppPath() : path.join(__dirname, '../'), './openProxy.js'), [], {
    detached: !!_isWindows,
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })

  _ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
    writeFile.close()
  })

  function error (e) {
    console.log('error: ' + e)
    _rej({error: e})
  }

  _ls.on('error', error)

  _ls.on('message', function (message) {
    _ls.removeListener('error', error)
    if (message.success) {
      childProcess.set(id, _ls)

      // 记录代理日志
      writeFile = new MyFile(id)
      _ls.stdout.pipe(writeFile.writeAble)

      _res([message, id])
    } else if (message.error) {
      _rej(message)
    } else {
      listen([message, id])
    }
  })

  _ls.send({ open: {
    port: args.port,
    proxyPort: args.proxyPort,
    youtubeProxyPort: args.youtubeProxyPort,
    id
  } })

  return _promise
}

module.exports = openProxy
