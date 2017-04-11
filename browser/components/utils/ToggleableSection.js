import React, { Component } from 'react'
import Button from '../atoms/Button/index'
import Icon from '../atoms/Icon/index'
import './ToggleableSection.sass'

export default class ToggleableSection extends Component {
  static initialState = true
  
  constructor(props) {
    super(props)
    this.state = {
      open: this.constructor.initialState
    }
  }

  toggle() {
    this.setState({
      open: !this.state.open
    })
  }

  render(){
    return <div className="ToggleableSection">
      <h1>
        <Button className= "ToggleableSection-button" onClick={this.toggle.bind(this)}>
          <Icon type={this.state.open ? 'caret-down' : 'caret-right'} />
        </Button>
        {this.props.title}
      </h1>
      {this.state.open ? this.props.children : null}
    </div>
  }
}
