const { readFileSync } = require('fs')
const { getToken, getItem, listChildren } = require('sor')

async function handler({ path, queryStringParameters, headers }) {
  const { id, key, type } = queryStringParameters
  const { access_key } = process.env

  if (path === '/favicon.ico' && access_key != key) {
    return null
  }

  const access_token = await getToken()

  if (!access_token) {
    return null
  }

  if (path.endsWith('/') && type !== 'file') {
    // Render folder
    const isReturnJson = type === 'json'
      || (headers['content-type'] && headers['content-type'].includes('json'))

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
            params: '?'
              + new URLSearchParams({
                id: ele.id,
                key: key || '',
                type: ele.file ? 'file' : '',
              }).toString(),
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
    // Render file
    const data = await getItem(path, access_token, id)
    if (data) {
      return {
        isBase64Encoded: false,
        statusCode: 307,
        headers: { Location: data['@microsoft.graph.downloadUrl'].slice(6) },
        body: null,
      }
    } else return 'Resource not found'
  }
}

exports.main = handler
