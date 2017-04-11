import React from 'react'
import { render } from 'react-dom'
import './index.sass'
import Root from './components/Root'
import './favicon.js'

render(
  <Root />,
  document.querySelector('main')
);


// for debugging

import state from './state'
import moment from 'moment'
import request from './request'
import logger from './logger'
import Prrrs from './Prrrs'
window.DEBUG = window.DEBUG || {}
window.DEBUG.state = state
window.DEBUG.React = React
window.DEBUG.moment = moment
window.DEBUG.request = request
window.DEBUG.logger = logger
window.DEBUG.prrrs = _ => {
  const {session, prrrs} = state.get()
  return new Prrrs({currentUser: session.user, prrrs})
}
