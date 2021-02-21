const fetch = require('node-fetch')
const sstore = require('@beetcb/sstore')
require('dotenv').config()

const timestamp = () => (Date.now() / 1000) | 0

function checkExpired(token) {
  const { expires_at } = token
  if (timestamp() > expires_at) {
    return true
  }
}

async function acquireToken() {
  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
  }
  const {
    client_id,
    client_secret,
    refresh_token,
    redirect_uri,
    auth_endpoint,
  } = process.env

  try {
    const res = await fetch(`${auth_endpoint}/token`, {
      method: 'POST',
      body: `${new URLSearchParams({
        grant_type: 'refresh_token',
        client_id,
        client_secret,
        refresh_token,
      }).toString()}&redirect_uri=${redirect_uri}`,
      headers,
    })
    return await storeToken(res)
  } catch (e) {
    console.warn(e.statusText)
  }
}

// Get & Store access_token from/to db
// Using sstore as fake db
function db(token) {
  return token ? sstore.set('token', token) : sstore.get('token')
}

async function storeToken(res) {
  const { expires_in, access_token, refresh_token } = await res.json()
  const expires_at = timestamp() + expires_in
  const token = { expires_at, access_token, refresh_token }
  return db(token)
}

exports.getToken = async () => {
  let token = db()
  if (!token || checkExpired(token)) token = await acquireToken()
  sstore.close()
  return token.access_token
}

exports.drive_api = process.env.drive_api
