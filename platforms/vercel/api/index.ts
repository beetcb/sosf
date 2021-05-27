import { readFileSync } from 'fs'
import { getToken, getItem, listChildren } from '@beetcb/sor'
import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, key, type, path } = req.query as { [key: string]: string }
  const { access_key } = process.env
  const headers = req.headers

  if (path === '/favicon.ico' && access_key != key) {
    return null
  }

  const access_token = await getToken()

  if (!access_token) {
    return null
  }

  if ((path as string).endsWith('/') && type !== 'file') {
    // Render folder
    const isReturnJson =
      type === 'json' ||
      (headers['content-type'] && headers['content-type'].includes('json'))

    // Render html first
    if (!isReturnJson) {
      res.status(200).send(readFileSync('index.html', { encoding: 'utf-8' }))
      return
    } else {
      const data = await listChildren(path, access_token, id, key)
      if (data) {
        const itemTable = data.value.reduce((arr, ele) => {
          arr.push({
            name: `${ele.name}${ele.file ? '' : '/'}`,
            params:
              '?' +
              new URLSearchParams({
                id: ele.id,
                key: key || '',
                type: ele.file ? 'file' : '',
              }).toString(),
          })
          return arr
        }, [])

        res.status(200).json(itemTable)
      }
    }
  } else {
    // Render file
    const data = await getItem(path, access_token, id)
    res.redirect(data['@microsoft.graph.downloadUrl'].slice(6))
  }
}
