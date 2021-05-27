const fetch = require('node-fetch')
const sstore = require('@beetcb/sstore')

const { getItem, listChildren, listRoot } = require('./graph/endpoint')

require('dotenv').config()

// Get & Store access_token from/to db
// Using tcb-sstore as fake db
function db(token) {
  return token ? sstore.set('token', token) : sstore.get('token')
}

const checkExpired = (token) => {
  const { expires_at } = token
  if (timestamp() > expires_at) {
    console.log('Token expired')
    return true
  }
}

const timestamp = () => (Date.now() / 1000) | 0

const getFetchOpts = (a_t) => {
  const opts = {
    headers: {
      Authorization: `bearer ${a_t}`,
    },
    compress: false,
  }
  return opts
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
  if (!token || checkExpired(token)) {
    token = await acquireToken()
  } else {
    console.log('Grab token from sstore!')
  }
  sstore.close()
  return token.access_token
}

exports.getItem = async (path, access_token, item_id = '') => {
  const base_dir = process.env.base_dir || ''
  const graph = getItem`drive${process.env.drive_api}id${item_id}path${[
    base_dir,
    path,
  ]}select${`@microsoft.graph.downloadUrl`}`

  const res = await fetch(graph, getFetchOpts(access_token))
  if (res.ok) {
    return await res.json()
  } else {
    console.error(res.statusText)
    return null
  }
}

exports.listChildren = async (path, access_token, item_id = '') => {
  const { base_dir } = process.env
  const graph =
    path === '/' && !item_id
      ? listRoot`drive${process.env.drive_api}select${`id,name,file`}`
      : listChildren`drive${process.env.drive_api}id${item_id}path${[
          base_dir,
          path,
        ]}select${`id,name,file`}`

  const res = await fetch(graph, getFetchOpts(access_token))
  if (res.ok) {
    return await res.json()
  } else {
    console.error(res.statusText)
    return null
  }
}

exports.drive_api = process.env.drive_api
