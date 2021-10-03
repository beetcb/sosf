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
    return `${drive}/items/${id}${select ? `?$select=${select}` : ''}`
  } else {
    return `${drive}/root:${join(...path)}${select ? `?$select=${select}` : ''}`
  }
}

exports.listChildren = (strs, ...parmas) => {
  const [drive, id, path, select] = parseStrs(strs, parmas)
  if (id) {
    return `${drive}/items/${id}/children`
  } else {
    return `${drive}/root:${join(...path).slice(0, -1)}:/children${
      select ? `?$select=${select}` : ''
    }`
  }
}

exports.listRoot = (strs, ...parmas) => {
  const [drive, _, __, select] = parseStrs(strs, parmas)
  return `${drive}/root/children${select ? `?$select=${select}` : ''}`
}
