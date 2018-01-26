const {mainWindow} = require('../utils/map')
const {app} = require('electron')

let isPrepareToQuit = false

function destroy () {
  // appIcon.destroy() // 此时destroy会导致tray的mouseExit触发不能获取对应的参数
  global.beforeQuitEvent.on(() => {
    mainWindow.get('mainWindow').destroy()
    mainWindow.delete('mainWindow')
    isPrepareToQuit = true
    app.quit()
  })
}

module.exports = {
  destroy,
  isPrepareToQuit: () => isPrepareToQuit
}
