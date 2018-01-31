const {ipcMain, shell} = require('electron')
var openProxy = require('./proxy')
const {mainWindow} = require('../utils/map')
const {_isWindows} = require('../utils/platform')
const setProxyScript = require('./script/childProcess')
const {exec} = require('child_process')
const childProcess = require('../utils/map').childProcess
const {proxyServerEvent} = require('../utils/event')

ipcMain.on('createServer', function (event, args) {
  const win = mainWindow.get('mainWindow')
  openProxy(args, (args) => {
    const message = args[0]
    if (message.closeServer) {
      proxyServerEvent.emit('closeServer', {id: args[1], message})
      win.webContents.send('message', {error: message.closeServer})
    }
  })
    .then((res) => {
      let message = res[0]
      let id = res[1]
      win.webContents.send('message', message)
      win.webContents.send('serverOpenResult', {id, code: 0, args})

      global.beforeQuitEvent.register(next => {
        return () => {
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
      }, id)

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
          } else {
            next()
          }
        }
      })
    }).catch(e => {
      win.webContents.send('message', e)
    })
})

ipcMain.on('closeServer', function (event, args) {
  proxyServerEvent.emit('closeServer', args)
})

proxyServerEvent.on('closeServer', function (args) {
  const id = args.id
  // const message = args.message
  if (!id) return
  setProxyScript.waitForChildProcessClose(childProcess.get(id)).then(() => {
    childProcess.delete(id)
    const win = mainWindow.get('mainWindow')
    exec(setProxyScript.getScriptOfDeletePacURL()) // 关闭代理
    win.webContents.send('serverCloseResult', {id, code: 0})
    global.beforeQuitEvent.remove(id)
  })
})

ipcMain.on('openLogFile', function (event, args) {
  const id = args.id
  if (!id) return

  const MyFile = require('./file/file')
  shell.openItem(MyFile.logPathNameById(id))
})
