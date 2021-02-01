const fetch = require('node-fetch')
const { URL } = require('url')
const { getFile } = require('./file')
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

async function getToken() {
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

async function handler(req, res) {
  const pathname = req.url
  if (pathname === '/') res.end('Plz specify the <path> param. For example: https://your.app?path=/demo.svg')
  const access_token = await getToken()
  const data = await getFile(pathname, access_token)

  if (data) {
    res.writeHead(302, {
      Location: data['@microsoft.graph.downloadUrl'],
    })
    res.end()
  } else res.end('Resource not found')
}

module.exports = handler
