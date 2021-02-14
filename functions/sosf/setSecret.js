const fs = require('fs')
module.exports = function (conf) {
  fs.readFileSync('./.env', doc => {
    if (!doc) return
    doc.split('\n').forEach(line => {
      const [key, value] = line.split(' = ')
      conf.setGlEnv(key, value)
    })
  })
}
