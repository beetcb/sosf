const { getToken, getFile } = require('./api')
require('dotenv').config()

async function handler(req, res) {
  const pathname = req.url
  switch (pathname) {
    case '/1.1/functions/_ops/metadatas':
    case '/__engine/1/ping':
    case '/':
      res.end('Plz specify the <path> param. For example: https://your.app/path/to/file')
      break
    default:
      const access_token = await getToken()
      const data = await getFile(pathname, access_token)

      if (data) {
        res.writeHead(307, {
          Location: data['@microsoft.graph.downloadUrl'].slice(6),
        })
        res.end()
      } else res.end('Resource not found')
  }
}

module.exports = handler
