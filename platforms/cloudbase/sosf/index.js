const { getToken, getItem, listChildren } = require('@beetcb/sor')

async function handler({ path, queryStringParameters, headers }) {
  const { id, key, type } = queryStringParameters
  const { access_key } = process.env
  const isReqFolder = path.endsWith('/') && type !== 'file'

  if (path === '/favicon.ico' || (isReqFolder && access_key != key)) {
    return null
  }

  const access_token = await getToken()

  if (!access_token) {
    return null
  }

  if (isReqFolder && type !== 'file') {
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
        body: `        
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <link
              href="https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css"
              rel="stylesheet"
            />
            <link
              rel="stylesheet"
              href="https://cdn.jsdelivr.net/npm/@tailwindcss/ui@latest/dist/tailwind-ui.min.css"
            />
            <script src="https://cdn.jsdelivr.net/npm/gridjs/dist/gridjs.production.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/feather-icons/dist/feather.min.js"></script>
            <script defer src="https://cdn.jsdelivr.net/gh/beetcb/sosf@fb3c58d00df984e0ffde75424a7d787733c42da0/platforms/template.js"></script>
          </head>
          <body></body>
        </html>  
        `,
      }
    } else {
      const data = await listChildren(path, access_token, id, key)
      if (data) {
        const itemTable = data.value.reduce((arr, ele) => {
          arr.push({
            name: `${ele.name}${ele.file ? '' : '/'}`,
            params: '?'
              + new URLSearchParams(
                `${ele.id ? `&id=${ele.id}` : ''}${
                  key && !ele.file ? `&key=${key}` : ''
                }${ele.file ? '&type=file' : ''}`,
              ).toString(),
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
