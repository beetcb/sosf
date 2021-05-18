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
    if (path.endsWith('/')) {
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
          body: `<!DOCTYPE html>
          <html lang="en">
            <head>
              <link
                href="https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css"
                rel="stylesheet"
              />
            </head>
            <body>
              <div id="wrapper"></div>
              <script src="https://cdn.jsdelivr.net/npm/gridjs/dist/gridjs.production.min.js"></script>
              <script>
              new gridjs.Grid(
                {
                  columns: ['Resource', 
                    { 
                      name: 'Actions',
                      formatter: (cell, row) => {
                        return gridjs.h('button', {
                          className: 'py-2 mb-4 px-4 border rounded-md text-white bg-blue-600',
                          onClick: () => window.location.replace(row.cells[1].data),
                        }, 'Link');
                      }
                    }
                  ],
                  search: true,
                  server: {
                    url: \`\$\{location.href\}?type=json&key=${key || ''}\`,
                    then: data => data.map(({name, id}) => {
                        const item = {
                          resource: name, 
                          actions: \`\$\{location.href\}?id=\$\{id\}&key=${
                            key || ''
                          }\`}
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
