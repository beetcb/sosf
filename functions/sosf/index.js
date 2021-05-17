const { getToken, getFile, listChildren } = require('./api')

async function handler({ path, queryStringParameters }) {
  if (path === '/favicon.ico') {
    return null
  }

  const access_token = await getToken()
  if (!access_token) {
    return null
  } else {
    if (path.endsWith('/')) {
      const data = await listChildren(
        path,
        access_token,
        queryStringParameters.id
      )
      if (data) {
        return data.value.reduce((obj, ele) => {
          obj[ele.name] = ele.id
          return obj
        }, {})
      }
    } else {
      const data = await getFile(path, access_token)
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
