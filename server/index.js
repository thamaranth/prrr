import './environment'
import webServer from './webServer'

if (process.env.NODE_ENV !== 'test'){
  webServer.start(process.env.PORT)
}

export default webServer
