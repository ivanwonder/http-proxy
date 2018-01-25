const path = require('path')
const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const app = electron.app
const url = require('url')
const ipc = electron.ipcMain
const Menu = electron.Menu
const Tray = electron.Tray
const {mainWindow} = require('../utils/map')
const {_buildByWebpack, _isMacintosh} = require('../utils/platform')

let shareprocess

let appIcon = null

ipc.on('put-in-tray', function (event) {
  const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png'
  const iconPath = path.join(_buildByWebpack ? app.getAppPath() : path.resolve(__dirname), './resource/' + iconName)
  appIcon = new Tray(iconPath)
  let options = [{
    label: 'close app',
    click: function () {
      event.sender.send('tray-removed')
    }
  }]

  if (_isMacintosh) {
    options.push({
      label: 'open app',
      click: function () {
        mainWindow.get('mainWindow').show()
      }
    })
  }
  const contextMenu = Menu.buildFromTemplate(options)
  appIcon.on('double-click', function () {
    mainWindow.get('mainWindow').show()
  })
  appIcon.setToolTip('Electron Demo in the tray.')
  appIcon.setContextMenu(contextMenu)
})

ipc.on('remove-tray', function () {
  function destroy () {
    appIcon.destroy()
    mainWindow.get('mainWindow').destroy()
    mainWindow.delete('mainWindow')
  }

  global.beforeQuitEvent.on(() => {
    destroy()
    app.quit()
  })
})

if (!shareprocess) {
  shareprocess = new BrowserWindow({width: 800, height: 600, show: false})

  // and load the index.html of the app.
  shareprocess.loadURL(url.format({
    pathname: path.join(_buildByWebpack ? app.getAppPath() : path.resolve(__dirname), './shareprocess.html'),
    protocol: 'file:'
  }))

  shareprocess.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    shareprocess = null
  })
}
