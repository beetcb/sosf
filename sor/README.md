### SOR makes it easy to access sharepoint & onedrive resource API

Just get started directly with the beautiful DTS prompt

### How to authenticate ms graph?

Plz make sure the following environment variables key is set:

```ts
export interface GraphAuthEnv {
  [(key in 'client_id') |
    'client_secret' |
    'refresh_token' |
    'redirect_uri' |
    'auth_endpoint']: string
}
```
