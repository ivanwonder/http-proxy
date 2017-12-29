var fs = require('fs')
var tar = require('tar')
var argv = require('yargs')
  .default({dir: './tar/', target: './tarSource/my-tarball.tgz'})
  .argv

tar.c(
  {
    gzip: true
  },
  [argv.dir]
).pipe(fs.createWriteStream(argv.target))
