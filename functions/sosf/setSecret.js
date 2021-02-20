const fs = require('fs')
module.exports = function (sstore) {
  const doc = fs.readFileSync('./.env', 'utf8')
  if (!doc) return
  doc.split('\n').forEach(line => {
    const [key, value] = line.split(' = ')
    console.log(Boolean(key && value))
    if (key && value) sstore.setGlEnv(key, value.replace(/\s/g, ''))
  })
}
