var electronInstaller = require('electron-winstaller')

var resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: './proxy-server-win32-x64',
  outputDirectory: './build/installer64',
  authors: 'My App Inc.',
  // exe: 'myapp.exe',
  description: 'proxy server'
})

resultPromise.then(() => console.log('It worked!'), (e) => console.log(`No dice: ${e.message}`))
