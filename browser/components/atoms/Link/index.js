import React, { Component, PropTypes } from 'react'
import { Link } from 'simple-react-router'
import './index.sass'

export default class extends Component {
  render(){
    return <Link
      {...this.props}
      className={`Link ${this.props.className||''}`}
    />
  }
}
