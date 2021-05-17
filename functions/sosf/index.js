const { getToken, getItem, listChildren } = require('./api/sosf')

async function handler({ path, queryStringParameters, headers }) {
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
        const itemTable = data.value.reduce((arr, ele) => {
          arr.push({ name: ele.name, id: ele.id })
          return arr
        }, [])
        const docType = headers['content-type']
        return {
          isBase64Encoded: false,
          statusCode: 200,
          headers: {
            'content-type': docType,
          },
          body: docType.includes('json')
            ? itemTable
            : `<!DOCTYPE html>
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
              new gridjs.Grid({
                columns: ['Name', 'ID'],
                data: JSON.parse("${JSON.stringify(
                  itemTable
                )}")}).render(document.getElementById("wrapper"));
              </script>
            </body>
          </html>
          
          `,
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
