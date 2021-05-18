const { readFileSync } = require('fs')
const { getToken, getItem, listChildren } = require('./api/sosf')

async function handler({ path, queryStringParameters, headers }) {
  if (path === '/favicon.ico') {
    return null
  }

  const access_token = await getToken()
  const { id, key, type } = queryStringParameters

  if (!access_token) {
    return null
  } else {
    if (path.endsWith('/') && type !== 'file') {
      const isReturnJson =
        type === 'json' ||
        (headers['content-type'] && headers['content-type'].includes('json'))

      // Render html first
      if (!isReturnJson) {
        return {
          isBase64Encoded: false,
          statusCode: 200,
          headers: {
            'content-type': 'text/html',
          },
          body: readFileSync('index.html', { encoding: 'utf-8' }),
        }
      } else {
        const data = await listChildren(path, access_token, id, key)
        if (data) {
          const itemTable = data.value.reduce((arr, ele) => {
            arr.push({
              name: `${ele.name}${ele.file ? '' : '/'}`,
              params: encodeURIComponent(
                `?id=${ele.id}&key=${key || ''}&type=${ele.file ? 'file' : ''}`
              ),
            })
            return arr
          }, [])

          return {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {
              'content-type': 'application/json',
            },
            body: itemTable,
          }
        }
      }
    } else {
      const data = await getItem(path, access_token)
      if (data)
        return {
          isBase64Encoded: false,
          statusCode: 307,
          headers: { Location: data['@microsoft.graph.downloadUrl'].slice(6) },
          body: null,
        }
      else return 'Resource not found'
    }
  }
}

exports.main = handler
