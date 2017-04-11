import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import Prrrs from '../../../Prrrs'
import Date from '../../atoms/Date'
import Button from '../../atoms/Button'
import GithubUsername from '../../atoms/GithubUsername'
import PrrrsTable from '../PrrrsTable'
import ErrorMessage from '../../atoms/ErrorMessage'

export default class MyReviewedPrrrs extends Component {
  static propTypes = {
    currentUser: PropTypes.object.isRequired,
    prrrs: PropTypes.instanceOf(Prrrs).isRequired,
  }

  renderAdditionalHeaders(){
    return [
      <th key="claimed">Time Claimed</th>,
      <th key="completed">Completed</th>,
    ]
  }
  renderAdditionalCells = (prrr) => {
    const { currentUser } = this.props
    return [
      <td key="claimed">
        <span>&nbsp;</span>
        <Date fromNow date={prrr.claimed_at} />
      </td>,
      <td key="completed">
        <span>&nbsp;</span>
        <Date fromNow date={prrr.completed_at} />
      </td>,
    ]
  }
  render(){
    const { currentUser } = this.props
    const prrrs = this.props.prrrs.reviewdByMe()
      .sort((a, b) =>
        moment(b.created_at).valueOf() -
        moment(a.created_at).valueOf()
      )
    return <div>
      <PrrrsTable
        className="MyReviewedPrrrs"
        currentUser={currentUser}
        prrrs={prrrs}
        renderAdditionalHeaders={this.renderAdditionalHeaders}
        renderAdditionalCells={this.renderAdditionalCells}
      />
    </div>
  }
}
