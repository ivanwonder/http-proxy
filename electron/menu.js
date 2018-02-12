const {app, Menu, shell} = require('electron')
const {_buildByWebpack} = require('../utils/platform')
const path = require('path')

const template = [
  {
    label: 'Edit',
    submenu: [
      {role: 'toggledevtools'},
      {label: 'edit pac', click () { shell.openItem(path.join(_buildByWebpack ? app.getAppPath() : path.join(__dirname, '../'), './pac')) }}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { shell.openExternal('https://github.com/ivanwonder/http-proxy') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)
