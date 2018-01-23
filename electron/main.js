const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const {mainWindow, childProcess} = require('../utils/map')
const {_buildByWebpack, _isWindows} = require('../utils/platform')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(_buildByWebpack ? app.getAppPath() : path.resolve(__dirname), './index.html'),
    protocol: 'file:',
    slashes: true
  }))

  mainWindow.set('mainWindow', win)

  require('./tray.js')
  var openProxy = require('./proxy')

  ipcMain.on('createServer', function (event, args) {
    openProxy(args).then((message, id) => {
      win.webContents.send('message', message)
    }).catch(e => {
      win.webContents.send('message', e)
    })
  })

  // Open the DevTools.
  win.webContents.openDevTools()

  win.on('close', (event) => {
    win.hide()
    event.preventDefault()
  })
}

app.on('quit', function () {
  win = null
})
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

app.on('will-quit', function () {
  let iter = childProcess.keys()
  let value = iter.next()
  while (!value.done) {
    let _cp = childProcess.get(value.value)
    if (_isWindows) {
      _cp.kill('SIGINT')
    } else {
      process.kill(_cp.pid, 'SIGINT')
    }
    childProcess.delete(value.value)
    value = iter.next()
  }
})
