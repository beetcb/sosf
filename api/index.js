const { getToken, getFile } = require('./api')

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
