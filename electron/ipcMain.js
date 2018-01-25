const {ipcMain} = require('electron')
var openProxy = require('./proxy')
const {mainWindow} = require('../utils/map')
const {_isWindows} = require('../utils/platform')
const setProxyScript = require('./script/childProcess')
const {exec} = require('child_process')

ipcMain.on('createServer', function (event, args) {
  const win = mainWindow.get('mainWindow')
  openProxy(args).then((res) => {
    let message = res[0]
    let id = res[1]
    win.webContents.send('message', message)

    global.beforeQuitEvent.register(next => {
      return () => {
        let childProcess = require('../utils/map').childProcess
        let cp = childProcess.get(id)
        if (!cp) {
          next()
          return
        }
        cp.on('close', () => {
          next()
        })
        cp.on('error', (e) => {
          win.webContents.send('message', {error: e})
        })
        cp.kill()
      }
    })

    if (_isWindows) {
      // setProxyScript.execReplaceProxyOnWindow(args.port)
      exec(setProxyScript.getScriptOfSetPacURL(args.port))
    } else {
      setProxyScript.execReplaceProxy(args.port)
    }

    global.beforeQuitEvent.register(next => {
      return () => {
        if (_isWindows) {
          // setProxyScript.execReplaceProxyOnWindow(null, true, () => next())
          exec(setProxyScript.getScriptOfDeletePacURL(), (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`)
            }
            next()
          })
            .on('error', () => {
              // 忽略失败的消息，继续走关闭app的流程
              next()
            })
        }
      }
    })
  }).catch(e => {
    win.webContents.send('message', e)
  })
})
