import React, { Component, PropTypes } from 'react'
import ErrorMessage from '../../atoms/ErrorMessage'
import './index.sass'

export default class Errors extends Component {

  static propTypes = {
    errors: PropTypes.array.isRequired,
  }

  render(){
    const errors = this.props.errors.map((error, index) =>
      <ErrorMessage key={index} error={error} />
    )
    return <div className="Errors">
      {errors}
    </div>
  }
}
