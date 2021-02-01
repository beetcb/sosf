const fetch = require('node-fetch')
require('dotenv').config()
const { drive_api } = process.env

exports.getFile = async (path, access_token) => {
  const res = await fetch(`${drive_api}/root:${path}?select=%40microsoft.graph.downloadUrl,name,size,file`, {
    headers: {
      Authorization: `bearer ${access_token}`,
    },
  })
  if (res.ok) return await res.json()
  else console.error(res)
}
