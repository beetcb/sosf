const fetch = require('node-fetch')
const { join } = require('path')

const parseStrs = (strs, parmas) =>
  [
    strs.indexOf('drive'),
    strs.indexOf('id'),
    strs.indexOf('path'),
    strs.indexOf('select'),
  ].map((idx) => parmas[idx])

exports.getItem = (strs, ...parmas) => {
  const [drive, id, path, select] = parseStrs(strs, parmas)
  if (id) {
    return `${drive}/items/${id}?$select=${select}`
  } else {
    return `${drive}/root:${join(path)}?$select=${select}`
  }
}

exports.listChildren = (strs, ...parmas) => {
  const [drive, id, path, select] = parseStrs(strs, parmas)
  if (id) {
    return `${drive}/items/${id}`
  } else {
    return `${drive}/root:${join(path)}:/children?$select=${select}`
  }
}

exports.listRoot = (strs, ...parmas) => {
  const [drive, _, _, select] = parseStrs(strs, parmas)
  return `${drive}/root/children?$select=${select}`
}
