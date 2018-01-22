let ls
const map = require('../utils/map')

function openProxy (args) {
  const fork = require('child_process').fork
  ls = fork(`${__dirname}/../openProxy.js`, [], {
    // detached: true
  })

  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`)
  })

  ls.on('error', function (e) {
    console.log('error: ' + e)
  })

  ls.on('message', function (message) {
    map.get('mainWindow').webContents.send('message', message)
  })

  ls.send({ open: {
    port: args.port,
    proxyPort: args.proxyPort,
    youtubeProxyPort: args.youtubeProxyPort
  } })
}

const electron = require('electron')
const ipc = electron.ipcMain

electron.app.on('will-quit', function () {
  ls && ls.kill()
})

ipc.on('createServer', function (event, args) {
  openProxy(args)
})
