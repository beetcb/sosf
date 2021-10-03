const fetch = require('node-fetch')
const KV = require('./graph/kvdb')

require('dotenv').config()

const checkExpired = (token) => {
  const { expires_at } = token
  if (timestamp() > expires_at) {
    console.log('Token expired')
    return true
  }
}

const timestamp = () => (Date.now() / 1000) | 0

async function acquireToken(refresh_token) {
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

exports.getToken = async (access_token) => {
  // Grab access token
  let token = await KV.get('access_token', access_token)
  if (token) {
    token = JSON.parse(token)
  } else if (!token || checkExpired(token)) {
    token = await acquireToken()
  }

  return token.access_token
}

exports.getFetchOpts = (a_t, opts) => {
  const { body, contentType, method } = opts ?? {}
  const options = {
    headers: {
      Authorization: `bearer ${a_t}`,
      'Content-Type': body && contentType,
    },
    method: body && method,
    body: body,
    compress: false,
  }
  return options
}
