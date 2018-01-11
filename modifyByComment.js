var fs = require('fs')
var argv = require('yargs')
  .default({file: './static/log.js', target: './static/interaction.js'})
  .argv

var reg = /(^ *?\/\/ *?replaceValue +?)('|")(.*?)(\2\s*.*= *?)('|")(.*?)(\5 *?)/gm

fs.readFile(argv.file, 'UTF-8', (err, data) => {
  if (err) throw err
  var _translate = data.replace(reg, function (match, p1, p2, p3, p4, p5, p6, p7) {
    return `${p1}${p2}${p3}${p4}${p5}${p3}${p7}`
  })

  if (_translate === data) {
    console.log('no content change')
    return
  }

  fs.writeFile(argv.target, _translate, function (err) {
    if (err) throw err
    console.log(`translate the file: ${argv.file} and put into ${argv.target}`)
  })
})
