const fetch = require('node-fetch')
const Conf = require('conf')
require('dotenv').config()
// Reset $XDG_CONFIG_HOME
process.env.XDG_CONFIG_HOME = '/tmp'
const conf = new Conf()

const timestamp = () => (Date.now() / 1000) | 0
const headers = {
  'content-type': 'application/x-www-form-urlencoded',
}

// Get & Store access_token from/to db
// Using tcb-conf as fake db
function db(token) {
  return token ? conf.set('token', token) : conf.get('token')
}

async function acquireToken() {
  const { client_id, client_secret, refresh_token, redirect_uri, auth_endpoint } = process.env

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
    console.warn(e)
  }
}

async function storeToken(res) {
  const { expires_in, access_token, refresh_token } = await res.json()
  const expires_at = timestamp() + expires_in
  const token = { expires_at, access_token, refresh_token }
  const db = AV.Object.createWithoutData('sosf', dbId)
  db.set('token', token)
  console.warn('Updating stored token')
  // Async it cause we can
  db.save()
  return token
}

function checkExpired(token) {
  const { expires_at } = token
  if (timestamp() > expires_at) {
    return true
  } else {
    console.warn('Using stored token')
  }
}

exports.getToken = async () => {
  // Grab access token
  let token = db()
  if (!token || checkExpired(token)) token = await acquireToken()
  return token.access_token
}

exports.drive_api = process.env.drive_api
