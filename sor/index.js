const fetch = require('node-fetch')
const { getFetchOpts, getToken } = require('./auth')

const { getItem, listChildren, listRoot } = require('./graph/endpoint')

require('dotenv').config()

const base_dir = process.env.base_dir || ''

exports.getItem = async (path, access_token, item_id = '') => {
  const graph = getItem`drive${process.env.drive_api}id${item_id}path${[
    base_dir,
    path,
  ]}select${`@microsoft.graph.downloadUrl`}`

  const res = await fetch(graph, getFetchOpts(access_token))
  if (!res.ok) {
    console.error(res.statusText)
    return null
  }
}

exports.listChildren = async (path, access_token, item_id = '') => {
  const graph =
    path === '/' && !item_id
      ? listRoot`drive${process.env.drive_api}select${`id,name,file`}`
      : listChildren`drive${process.env.drive_api}id${item_id}path${[
          base_dir,
          path,
        ]}select${`id,name,file`}`

  const res = await fetch(graph, getFetchOpts(access_token))
  if (!res.ok) {
    console.error(res.statusText)
    return null
  }
}

exports.createFolder = async (access_token, folderName) => {
  const graph = listRoot`drive${process.env.drive_api}select${`id,name,file`}`
  const res = await fetch(
    graph,
    getFetchOpts(access_token, {
      method: 'POST',
      contentType: 'application/json',
      body: {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      },
    })
  )
  if (!res.ok) {
    console.error(res.statusText)
    return null
  }
}

exports.drive_api = process.env.drive_api
exports.getToken = getToken
