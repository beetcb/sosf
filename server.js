const http = require('http')
const handler = require('./func/index')
const PORT = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 3000)
http.createServer(handler).listen(PORT)
