const { prompt } = require('inquirer')
const { EOL } = require('os')
const { writeFileSync } = require('fs')
const fetch = require('node-fetch')

const headers = {
  'content-type': 'application/x-www-form-urlencoded',
}

// Prompt and acquire code, returns credentials
async function init() {
  let questions = [
    {
      type: 'list',
      name: 'type',
      message: '请选择 onedrive & sharepoint 账户类型',
      choices: [
        {
          value: 1,
          name: 'global',
        },
        {
          value: 0,
          name: 'operated by 21Vianet in China',
        },
      ],
    },
    {
      type: 'list',
      name: 'dType',
      message: '请选择部署类型',
      choices: [
        {
          value: 1,
          name: 'onedrive',
        },
        {
          value: 0,
          name: 'sharepoint',
        },
      ],
    },
    {
      type: 'input',
      name: 'client_id',
      message: 'client_id:',
    },
    {
      type: 'input',
      name: 'client_secret',
      message: 'client_secret:',
    },
    {
      type: 'input',
      name: 'redirect_uri',
      message: 'redirect_uri:',
    },
  ]

  let res = await prompt(questions)

  const auth_endpoint = `${
    res.type
      ? 'login.microsoftonline.com'
      : 'https://login.partner.microsoftonline.cn'
  }/common/oauth2/v2.0`

  const { client_id, client_secret, redirect_uri } = res

  questions = [
    {
      type: 'input',
      name: 'code',
      message: `登录地址:${auth_endpoint}/authorize?${new URLSearchParams({
        client_id,
        scope: res.dType
          ? 'Files.Read.All Files.ReadWrite.All offline_access'
          : 'Sites.Read.All Sites.ReadWrite.All offline_access',
        response_type: 'code',
      }).toString()}&redirect_uri=${redirect_uri}\n请输入浏览器返回的地址:`,
    },
  ]

  res = await prompt(questions)
  const code = new URL(res.code).searchParams.get('code')
  const credentials = {
    code,
    client_id,
    client_secret,
    redirect_uri,
    auth_endpoint,
  }

  return credentials
}

// Acquire token with credentials, then output it
async function acquireToken({
  code,
  client_id,
  client_secret,
  redirect_uri,
  auth_endpoint,
}) {
  try {
    const res = await fetch(`${auth_endpoint}/token`, {
      method: 'POST',
      body: `${new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id,
        client_secret,
      }).toString()}&redirect_uri=${redirect_uri}`,
      headers,
    })
    const writeToEnv = {
      refresh_token: (await res.json()).refresh_token,
      client_id,
      client_secret,
      redirect_uri,
      auth_endpoint,
    }
    writeFileSync(
      '.env',
      Object.keys(writeToEnv).reduce((env, e) => {
        return `${env}${e} = ${writeToEnv[e]}${EOL}`
      }, '')
    )
    console.table(writeToEnv)
  } catch (e) {
    console.warn(e)
  }
}

;(async () => acquireToken(await init()))()
