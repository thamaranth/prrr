import React, { Component } from 'react'
import sadCat1 from '../../images/sadcat1.gif'
import sadCat2 from '../../images/sadcat2.gif'
import sadCat3 from '../../images/sadcat3.gif'
import sadCat4 from '../../images/sadcat4.gif'
import Link from '../atoms/Link'
import './NotFoundPage.sass'

const sadCats = [sadCat1, sadCat2, sadCat3, sadCat4]
const randomSadCat = _ =>
  sadCats[ Math.floor( Math.random() * sadCats.length )]

export default class NotFoundPage extends Component {

  constructor(props){
    super(props)
    this.state = {
      sadCat: randomSadCat()
    }
  }

  render(){
    return <div className="NotFoundPage">
      <h1 className="NotFoundPage-NotFound">Page Not Found</h1>
      <h2>{this.props.location.pathname}</h2>
      <img className="NotFoundPage-sadcat" src={this.state.sadCat}/>
      <p>
        <span>Maybe you should </span>
        <Link href="/">Go Home</Link>
        <span>?</span>
      </p>
      <p>
        <span>Or if you think you got this error by mistake </span>
        <Link href="https://github.com/GuildCrafts/prrr/issues/new">Click here to file and issue!</Link>
      </p>
    </div>
  }
}
