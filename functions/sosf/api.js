const fetch = require('node-fetch')
const AV = require('leanengine')
require('dotenv').config()

AV.init({
  appId: process.env.LEANCLOUD_APP_ID,
  appKey: process.env.LEANCLOUD_APP_KEY,
  masterKey: process.env.LEANCLOUD_APP_MASTER_KEY,
})
AV.Cloud.useMasterKey()
const dbId = process.env.dbId

const timestamp = () => (Date.now() / 1000) | 0
const headers = {
  'content-type': 'application/x-www-form-urlencoded',
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
  const query = new AV.Query('sosf')
  const db = await query.get(dbId)
  let token = db.get('token')
  if (token) {
    if (checkExpired(token)) token = await acquireToken()
  } else {
    token = await acquireToken()
  }
  return token.access_token
}

exports.drive_api = process.env.drive_api
