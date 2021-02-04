const fetch = require('node-fetch')
const cloudbase = require('@cloudbase/node-sdk')
const { URLSearchParams } = require('url') // NodeJS 8.9
const { getFile } = require('./fileRouter')

const timestamp = () => (Date.now() / 1000) | 0
const headers = {
  'content-type': 'application/x-www-form-urlencoded',
}

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
      headers,
    })
    return await storeToken(res)
  } catch (e) {
    console.warn(e)
  }
}

async function db(token) {
  const app = cloudbase.init({ env: process.env.ENV_ID })
  const db = app.database()
  if (!token) {
    const res = await db.collection('sosf').doc('token').get()
    const data = res.data[0]
    if (data) {
      console.log('Get token from database')
      return data
    }
  } else {
    await db.collection('sosf').doc('token').update(token)
    console.log('Stored token to database')
    return token
  }
}

async function storeToken(res) {
  const { expires_in, access_token, refresh_token } = await res.json()
  const expires_at = timestamp() + expires_in
  const token = { expires_at, access_token, refresh_token }
  return await db(token)
}

function checkExpired(token) {
  const { expires_at } = token
  if (timestamp() > expires_at) {
    console.log('Token expired')
    return true
  }
}

async function getToken() {
  let token = await db()
  if (!token || checkExpired(token)) token = await acquireToken()
  return token.access_token
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
