const {app} = require('electron')
if (require('electron-squirrel-startup')) {
  app.quit()
} else {
  require('./electron/main')
}
