const fs = require('fs')
module.exports = function (conf) {
  const doc = fs.readFileSync('./.env', 'utf8')
  if (!doc) return
  doc.split('\n').forEach(line => {
    const [key, value] = line.split(' = ')
    console.log(Boolean(key && value))
    if (key && value) conf.setGlEnv(key, value.replace(/\s/g, ''))
  })
}
