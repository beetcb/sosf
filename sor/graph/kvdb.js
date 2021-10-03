const crypto = require('crypto')
const fetch = require('node-fetch')

const { createHash } = require('crypto')
const { Buffer } = require('buffer')
const { getItem } = require('./endpoint')
const { getFetchOpts } = require('../auth')

const base_dir = process.env.base_dir || ''
const getGraphEndpoint = (key) =>
  getItem`drive${process.env.drive_api}path${[
    '/',
    base_dir,
    `db/${createHash('md5').update(key, 'utf8').digest('hex')}:/content`,
  ]}}`

const algorithm = 'aes-192-cbc'
const iv = Buffer.alloc(16)
const key = crypto.scryptSync(process.env.ENCRYPT_PASSWORD, 'salt', 24)

function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return encrypted
}
function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  const decrypted =
    decipher.update(encrypted, 'buffer', 'utf8') + decipher.final('utf8')
  return decrypted
}

exports.set = async (key, value, access_token) => {
  const graph = getGraphEndpoint(key)
  const res = await fetch(
    graph,
    getFetchOpts(access_token, {
      contentType: 'text/plain',
      method: 'PUT',
      body: encrypt(value),
    })
  )

  if (res.ok) {
    return true
  } else {
    console.error(res)
    return null
  }
}

exports.get = async (key, access_token) => {
  const graph = getGraphEndpoint(key)
  const res = await fetch(graph, getFetchOpts(access_token))
  if (res.ok) {
    const data = await res.buffer()
    return decrypt(data)
  } else {
    console.error(res.statusText)
    return null
  }
}
