const fetch = require('node-fetch')
const { getToken, drive_api } = require('./api')

async function getFile(path, access_token) {
  const res = await fetch(
    `${drive_api}/root:${path}?select=%40microsoft.graph.downloadUrl,name,size,file`,
    {
      headers: {
        Authorization: `bearer ${access_token}`,
      },
    }
  )
  if (res.ok) return await res.json()
  else console.error(res.statusText)
}

async function handler(req, res) {
  const { path } = req.query
  if (!path) {
    res.send(
      'Plz specify the <path> param. For example: https://your.app/?path=/demo.svg'
    )
  } else {
    const access_token = await getToken()
    const data = await getFile(path, access_token)

    if (data) res.redirect(data['@microsoft.graph.downloadUrl'])
    else res.send('Resource not found')
  }
}

module.exports = handler
