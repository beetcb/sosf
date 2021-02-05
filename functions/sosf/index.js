const fetch = require('node-fetch')
const { getToken, drive_api } = require('./api')
require('dotenv').config()

async function getFile(path, access_token) {
  const res = await fetch(`${drive_api}/root:${path}?select=%40microsoft.graph.downloadUrl,name,size,file`, {
    headers: {
      Authorization: `bearer ${access_token}`,
    },
  })
  if (res.ok) return await res.json()
  else console.error(`bad request to path: ${path}`)
}

async function handler(req, res) {
  const pathname = req.url
  switch (pathname) {
    case '/1.1/functions/_ops/metadatas':
    case '/__engine/1/ping':
    case '/':
      res.end('Plz specify the <path> param. For example: https://your.app?path=/demo.svg')
      break
    default:
      const access_token = await getToken()
      const data = await getFile(pathname, access_token)

      if (data) {
        res.writeHead(302, {
          Location: data['@microsoft.graph.downloadUrl'],
        })
        res.end()
      } else res.end('Resource not found')
  }
}

module.exports = handler
