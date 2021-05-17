const { getToken, getItem, listChildren } = require('./api/sosf')

async function handler({ path, queryStringParameters, headers }) {
  if (path === '/favicon.ico') {
    return null
  }

  const access_token = await getToken()
  const { id, key } = queryStringParameters

  if (!access_token) {
    return null
  } else {
    if (path.endsWith('/')) {
      const isJson =
        headers['content-type'] && headers['content-type'].includes('json')
      const data = await listChildren(path, access_token, id, key)
      // Render html first
      if (!isJson) {
        return {
          isBase64Encoded: false,
          statusCode: 200,
          headers: {
            'content-type': 'text/html',
          },
          body: `<!DOCTYPE html>
          <html lang="en">
            <head>
              <link
                href="https://unpkg.com/gridjs/dist/theme/mermaid.min.css"
                rel="stylesheet"
              />
            </head>
            <body>
              <div id="wrapper"></div>
              <script src="https://unpkg.com/gridjs/dist/gridjs.development.js"></script>
              <script>
              new gridjs.Grid(
                {
                  columns: ['File/Folder', 'Link'],
                  search: true,
                  server: {
                    url: \`\$\{location.href\}/?key=${key}\`,
                    then: data => data.map(({name, id}) => {
                        const item = {[name]: 'location.origin/?key=' + id}
                        return item
                      }
                    )
                  },
                }
                ).render(document.getElementById("wrapper"));
              </script>
            </body>
          </html>
          
          `,
        }
      } else {
        const data = await listChildren(path, access_token, id, key)
        if (data) {
          const itemTable = data.value.reduce((arr, ele) => {
            arr.push({ name: `${ele.name}${ele.file ? '' : '/'}`, id: ele.id })
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
