const fetch = require('node-fetch')
const Conf = require('@beetcb/tcb-conf')
const conf = new Conf(5)

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

// Init db, Get & Store access_token from/to db
// Using tcb-conf as db
function db(token) {
  token ? conf.get('token') : conf.set('token')
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
  return token.access_token
}

exports.drive_api = process.env.drive_api
