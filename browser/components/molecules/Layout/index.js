import React, { Component, PropTypes } from 'react'
import Navbar from '../Navbar'
import Errors from '../Errors'
import './index.sass'

export default class Layout extends Component {

  static propTypes = {
    session: PropTypes.object.isRequired,
  }

  render(){
    const { session, errors, children } = this.props
    const className = `Layout ${this.props.className||''}`
    return <div className={className}>
      <Navbar session={session} />
      <div className="Layout-content">
        <Errors errors={errors} />
        {children}
      </div>
    </div>
  }
}
