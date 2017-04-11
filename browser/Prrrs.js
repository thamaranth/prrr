export default class Prrrs {
  constructor({currentUser, prrrs={}}){
    this.currentUser = currentUser
    this.prrrs = prrrs
  }

  toArray(){
    return Object.keys(this.prrrs).map(prrrId => this.prrrs[prrrId])
  }

  byId(prrrId){
    this.prrrs[prrrId]
  }

  pending(){
    return this.toArray().filter(prrr =>
      prrr.requested_by !== this.currentUser.github_username &&
      !prrr.completed_at &&
      !prrr.archived_at &&
      !prrr.claimed_by &&
      !prrr.skipped
    )
  }

  claimed(){
    return this.toArray().find(prrr =>
      !prrr.completed_at &&
      !prrr.archived_at &&
      prrr.claimed_by === this.currentUser.github_username
    )
  }

  requestedByMe(){
    return this.toArray()
      .filter(prrr =>
        prrr.requested_by === this.currentUser.github_username &&
        prrr.archived_at === null
      )
  }

  reviewdByMe(){
    return this.toArray()
      .filter(prrr =>
        prrr.claimed_by === this.currentUser.github_username &&
        prrr.completed_at !== null
      )
  }
}
