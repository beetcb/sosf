import { readFileSync } from 'fs'
import { resolve } from 'path'
import { getToken, getItem, listChildren } from '@beetcb/sor'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, key, type, path } = req.query as { [K: string]: string }
  console.log(type)
  const { access_key } = process.env
  const isReqFolder = !id

  if (path === '/favicon.ico' || (isReqFolder && access_key != key)) {
    return null
  }

  const access_token = await getToken()

  if (!access_token) {
    return null
  }

  if (isReqFolder && type !== 'file') {
    // Render folder
    const isReturnJson =
      type === 'json' ||
      (req.headers['content-type'] &&
        req.headers['content-type'].includes('json'))

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
          </head>
          <body>
            <div id="wrapper"></div>
            <script src="https://cdn.jsdelivr.net/npm/gridjs/dist/gridjs.production.min.js"></script>
            <script src="https://cdn.jsdelivr.net/gh/beetcb/sosf/platforms/template.js"></script>
          </body>
        </html>        
        `,
      }
    } else {
      const data = await listChildren(path, access_token, id, key)
      if (data) {
        const itemTable = data.value.reduce((arr, ele) => {
          arr.push({
            name: `${ele.name}${ele.file ? '' : '/'}`,
            params:
              '?' +
              new URLSearchParams(
                `${ele.id ? `&id=${ele.id}` : ''}${
                  key && !ele.file ? `&key=${key}` : ''
                }${ele.file ? '&type=file' : ''}`
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
