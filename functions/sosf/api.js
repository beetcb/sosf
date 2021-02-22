const fetch = require('node-fetch')
const sstore = require('@beetcb/sstore')
require('dotenv').config()

// Get & Store access_token from/to db
// Using tcb-sstore as fake db
function db(token) {
  return token ? sstore.set('token', token) : sstore.get('token')
}

function checkExpired(token) {
  const { expires_at } = token
  if (timestamp() > expires_at) {
    console.log('Token expired')
    return true
  }
}

const timestamp = () => (Date.now() / 1000) | 0

async function acquireToken() {
  const {
    client_id,
    client_secret,
    refresh_token,
    redirect_uri,
    auth_endpoint,
  } = process.env

  try {
    console.log(auth_endpoint)
    const res = await fetch(`${auth_endpoint}/token`, {
      method: 'POST',
      body: `${new URLSearchParams({
        grant_type: 'refresh_token',
        client_id,
        client_secret,
        refresh_token,
      }).toString()}&redirect_uri=${redirect_uri}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    })
    return await storeToken(res)
  } catch (e) {
    console.warn(e)
  }
}

async function storeToken(res) {
  const { expires_in, access_token, refresh_token } = await res.json()
  const expires_at = timestamp() + expires_in
  const token = { expires_at, access_token, refresh_token }
  return db(token)
}

exports.getToken = async () => {
  // Grab access token
  let token = db()
  if (!token || checkExpired(token)) token = await acquireToken()
  else console.log('Grab token from sstore!')
  sstore.close()
  return token.access_token
}

exports.getFile = async (path, access_token) => {
  const base_dir = process.env.base_dir
  const res = await fetch(
    `${process.env.drive_api}/root:${encodeURI(
      base_dir ? base_dir + path : path
    )}?select=@microsoft.graph.downloadUrl`,
    {
      headers: {
        Authorization: `bearer ${access_token}`,
      },
    }
  )
  if (res.ok) return await res.json()
  else console.error(res.statusText)
}

exports.drive_api = process.env.drive_api
