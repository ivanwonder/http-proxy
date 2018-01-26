const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const {mainWindow} = require('../utils/map')
const {_buildByWebpack} = require('../utils/platform')
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

  // Open the DevTools.
  !_buildByWebpack && win.webContents.openDevTools()

  win.on('close', (event) => {
    win.hide()
    event.preventDefault()
  })

  // 加载必要代码
  require('../utils/gloable')
  require('./ipcMain')
  require('./tray.js')
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
  win = null
})

app.on('before-quit', function (event) {
  const _quit = require('./quit')
  if (!_quit.isPrepareToQuit()) {
    _quit.destroy()
    event.preventDefault()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  } else {
    win.show()
  }
})
