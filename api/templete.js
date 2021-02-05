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
  const res = await fetch(`${drive_api}/root/children`, {
    headers: {
      Authorization: `bearer ${access_token}`,
    },
  })
  if (res.ok) {
    res.sent(await res.json())
  }
}

module.exports = handler
