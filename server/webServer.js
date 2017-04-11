import './environment'
import path from 'path'
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import passport from 'passport'
import session from 'cookie-session'
import http from 'http'
import logger from './logger'
import webSocket from './webSocket'

const publicPath = path.resolve(__dirname, '../public')
const httpServer = express()

httpServer.use(morgan('dev', { "stream": logger.stream }));

if (process.env.NODE_ENV === 'test')
  process.env.SESSION_KEY = 'FAKE_TEST_SESSION_KEY'

httpServer.sessionMiddleware = session({
  name: 'session',
  keys: [process.env.SESSION_KEY],
})
httpServer.use(httpServer.sessionMiddleware)
httpServer.use(passport.initialize());
httpServer.use(passport.session());
httpServer.use(express.static(publicPath))
httpServer.use(bodyParser.json())

httpServer.use(require('./authentication'))

httpServer.get('/*', (req, res, next) => {
  if (req.xhr) return next()
  res.sendFile(publicPath+'/index.html')
});

httpServer.start = function(port, callback){
  httpServer.set('port', port)
  console.log(`http://localhost:${port}/`)
  const httpServerInstance = http.createServer(httpServer)
  httpServerInstance.listen(port, callback)
  webSocket.initialize(httpServer, httpServerInstance)
  return httpServerInstance
}

export default httpServer
