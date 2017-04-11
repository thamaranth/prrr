import React, { Component, PropTypes } from 'react'
import './index.sass'

export default class ErrorMessage extends Component {
  static propTypes = {
    error: PropTypes.object.isRequired
  };

  render(){
    const { error } = this.props
    return <div className="ErrorMessage">
      <div>Error {error.context}: </div>
      <div>{error.message}</div>
    </div>
  }
}

