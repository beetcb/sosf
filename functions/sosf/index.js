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

async function handler({ path }) {
  if (path === '/favicon.ico') return null
  const access_token = await getToken()
  const data = await getFile(path, access_token)
  if (data)
    return {
      statusCode: 302,
      headers: { Location: data['@microsoft.graph.downloadUrl'] },
      body: null,
    }
  else return 'Resource not found'
}

exports.main = handler
