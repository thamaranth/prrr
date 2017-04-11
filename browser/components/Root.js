import React, { Component } from 'react'
import state from '../state'
import Router from '../Router'
import InspectObject from './utils/InspectObject'

export default class Root extends Component {

  constructor(props){
    super(props)
    this.state = state.get()
    this.update = this.update.bind(this)
    state.subscribe(this.update)
  }

  componentWillUnmount(){
    state.unsubscribe(this.update)
  }

  update(newState){
    if (this.animationFrame)
      cancelAnimationFrame(this.animationFrame)
    this.animationFrame = requestAnimationFrame(_ => {
      this.setState(newState)
    })
  }

  render(){
    if (this.state.loadSessionError)
      return <div>
        <h1>ERROR:</h1>
        <InspectObject object={this.state.loadSessionError} />
      </div>
    if (this.state.session)
      return <Router {...this.state} />
    return <div>loading...</div>
  }
}
