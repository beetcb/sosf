const fetch = require('node-fetch')
const { getToken, drive_api } = require('./api')

async function handler(req, res) {
  /**
   * Grab access_token
   */
  const { access_token } = await getToken()
  /**
   * Using access_token to access graph api, drive_api is equivalent to the:
   * - `/sites/{site-id}/drive` in sharepoint
   * - `/me/drive` in onedrive
   */
  const rootRes = await fetch(`${drive_api}/root/children`, {
    headers: {
      Authorization: `bearer ${access_token}`,
    },
  })
  if (rootRes.ok) {
    res.end(await res.json())
  }
  res.end()
}

module.exports = handler
