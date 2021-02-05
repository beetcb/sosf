const http = require('http')
const handler = require('./functions/sosf/index')
const PORT = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000)
http.createServer(handler).listen(PORT)
