const fetch = require('node-fetch')
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

// Get or Update the token stored in the leancloud
async function db(token) {
  const { AppID, AppKey, dbId } = process.env
  const dbEndpoint = `https://${AppID.slice(
    0,
    8
  )}.api.lncldglobal.com/1.1/classes/sosf/${dbId}`
  const headers = {
    'X-LC-Id': AppID,
    'X-LC-Key': AppKey,
    'Content-Type': 'application/json',
  }

  if (!token) {
    const res = await fetch(dbEndpoint, {
      headers,
    })
    if (res.ok) {
      console.log('Get token form database')
      return (await res.json()).token
    }
  } else {
    const res = await fetch(dbEndpoint, {
      headers,
      body: JSON.stringify({ token }),
      method: 'PUT',
    })
    if (res.ok) {
      console.warn('Token stored to database')
    } else {
      console.error(res.statusText)
    }
    return token
  }
}

async function storeToken(res) {
  const { expires_in, access_token, refresh_token } = await res.json()
  const expires_at = timestamp() + expires_in
  const token = { expires_at, access_token, refresh_token }
  return await db(token)
}

exports.getToken = async () => {
  let token = await db()
  if (!token || checkExpired(token)) token = await acquireToken()
  return token.access_token
}

exports.drive_api = process.env.drive_api
