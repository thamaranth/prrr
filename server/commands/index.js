import knex from '../knex'
import Queries from '../queries'
import Github from '../Github'
import request from 'request-promise'

export default class Commands {

  constructor(currentUser, _knex=knex){
    this.currentUser = currentUser
    this.knex = _knex
    this.queries = new Queries(currentUser, _knex)
    if (this.currentUser)
      this.github = new Github(this.currentUser.github_access_token)
  }

  as(user){
    return new this.constructor(user, this.knex)
  }

  createRecord(table, attributes){
    return this.knex
      .table(table)
      .insert(attributes)
      .returning('*')
      .then(firstRecord)
  }

  createUser(attributes){
    attributes.created_at = attributes.updated_at = new Date
    return this.createRecord('users', attributes)
  }

  findOrCreateUserFromGithubProfile({accessToken, refreshToken, profile}){
    const userAttributes = {
      name: profile.displayName || profile.username,
      email: profile.emails[0].value,
      avatar_url: (
        profile.photos &&
        profile.photos[0] &&
        profile.photos[0].value
      ),
      github_id: profile.id,
      github_username: profile.username,
      github_access_token: accessToken,
      github_refresh_token: refreshToken,
    }
    return this.knex
      .table('users')
      .where('github_id', profile.id)
      .first('*')
      .then(user => user ? user : this.createUser(userAttributes))
  }

  reopenPrrr(id){
    return this.knex
      .update({
        archived_at: null,
        completed_at: null,
        claimed_by: null,
        claimed_at: null,
      })
      .table('pull_request_review_requests')
      .where('id', id)
      .returning('*')
      .then(firstRecord)
  }

  createPrrr({owner, repo, number}){
    return this.github.pullRequests.get({owner, repo, number})
      .catch(originalError => {
        const error = new Error('Pull Request Not Found')
        error.originalError = originalError
        error.status = 400
        throw error
      })
      .then(pullRequest =>
        this.github.repos.checkCollaborator({
          owner,
          repo,
          username: this.currentUser.github_username,
        })
        .catch( originalError => {
          const error = new Error(`You are not a collaborator on ${owner}/${repo}`)
          error.originalError = originalError
          error.status = 400
          throw error
        })
        .then( response => pullRequest )
      )
      .then(pullRequest =>
        this.queries.getPrrrForPullRequest(pullRequest)
          .then(prrr => ({prrr, pullRequest}))
      )
      .then(({prrr, pullRequest}) => {
        if (prrr) {
          return prrr.archived_at || prrr.completed_at
            ? this.reopenPrrr(prrr.id)
            : prrr
        }
        return this.createRecord('pull_request_review_requests',{
          owner,
          repo,
          number,
          requested_by: this.currentUser.github_username,
          created_at: new Date,
          updated_at: new Date,
        })
      })
  }

  getOwnerUserForPrrr(prrr){
    if (this.currentUser.github_username === prrr.owner)
      return Promise.resolve(this.currentUser)

    return this.queries.getUserByGithubUsername(prrr.owner)
  }

  addCurrentUserToPrrrRepo(prrr){
    return this.getOwnerUserForPrrr(prrr)
      .then(ownerUser => {
        if (!ownerUser)
          throw new Error(`unable to add ${this.currentUser.github_username} to ${prrr.owner}/${prrr.repo} because ${prrr.owner} does not have a Prrr account`)

        const github = this.as(ownerUser).github
        return github.repos.checkCollaborator({
          owner:    prrr.owner,
          repo:     prrr.repo,
          username: this.currentUser.github_username,
        })
        .catch(error => {
          if (error.code !== 404) throw error
          return github.repos.addCollaborator({
            owner:      prrr.owner,
            repo:       prrr.repo,
            username:   this.currentUser.github_username,
            permission: 'push',
          })
        })
      })
  }

  markPullRequestAsClaimed(prrrId){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        claimed_by: this.currentUser.github_username,
        claimed_at: new Date,
        updated_at: new Date,
      })
      .where('id', prrrId)
      .whereNull('claimed_by')
      .whereNull('claimed_at')
      .returning('*')
      .then(firstRecord)
  }

  sendReviewRequest(prrr){
    return request({
      uri: `https://api.github.com/repos/${prrr.owner}/${prrr.repo}/pulls/${prrr.number}/requested_reviewers`,
      method: 'POST',
      body: {
        reviewers: [
          this.currentUser.github_username,
        ],
      },
      headers: {
        'user-agent': 'prrr-learnersguild-org',
        'Authorization': `token ${this.currentUser.github_access_token}`,
        'Accept': 'application/vnd.github.black-cat-preview+json'
      },
      json: true,
    })
    .catch(originalError => {
      const error = new Error('Failed to create Github Pull Request Review Request')
      error.originalError = originalError
      error.status = 500
      throw error
    })
  }

  claimPrrr(prrrId){
    return this.queries.getPrrrById(prrrId)
      .then(prrr =>
        this.addCurrentUserToPrrrRepo(prrr)
        .then(_ => this.sendReviewRequest(prrr))
      )
      .then(_ => this.markPullRequestAsClaimed(prrrId))
  }

  unclaimPrrr(prrrId){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        claimed_by: null,
        claimed_at: null,
        updated_at: new Date,
      })
      .where('id', prrrId)
      .whereNotNull('claimed_by')
      .whereNotNull('claimed_at')
      .returning('*')
      .then(firstRecord)
  }

  unclaimStalePrrrs(prrr){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        claimed_by: null,
        claimed_at: null,
        updated_at: new Date,
      })
      .whereRaw(`claimed_at <= NOW() - '1 hour'::INTERVAL`)
      .whereNotNull('claimed_by')
      .whereNotNull('claimed_at')
      .whereNull('completed_at')
  }

  archivePrrr(purrId){
    return this.knex
      .table('pull_request_review_requests')
      .update({
        archived_at: new Date,
      })
      .where('id', purrId)
  }

  completePrrr(prrrId){
    return this.knex
    .table('pull_request_review_requests')
    .update({
      completed_at: new Date,
    })
    .where('id', prrrId)
    .returning('*')
    .then(firstRecord)
  }
}

const firstRecord = records => records[0]
