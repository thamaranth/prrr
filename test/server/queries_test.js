import moment from 'moment'
import knex from '../../server/knex'

describe('Queries', function(){

  context('as Nico', function(){

    let queries

    beforeEach(function(){
      return (new Commands()).createUser({
        name: 'Nico',
        email: 'nicosm310@gmail.com',
        avatar_url: 'https://avatars0.githubusercontent.com/u/18688343?v=3&s=460',
        github_id: 987654,
        github_username: 'nicosesma',
        github_access_token: 'FAKE_GITHUB_ACCESS_TOKEN',
        github_refresh_token: null,
      })
      .then(nico => {
        queries = new Queries(nico)
      })
    })

    describe('getPrrrs', function(){
      it('should resolve with all Prrrs', function(){
        return queries.getPrrrs()
          .then(prrrs => {
            expect(prrrs).to.be.an('object')
          })
      })
    })

    describe('getNextPendingPrrr', function(){
      it('should return the oldest unclaimed Prrr not requested by user', function(){
        const now = moment()
        const minutesAgo = minutes =>
          now.clone().subtract(minutes, 'minutes').toDate()

        const insertPrrr = attributes =>
          knex
            .insert(attributes)
            .into('pull_request_review_requests')

        const markPullRequestAsClaimed = prrr =>
          knex
            .table('pull_request_review_requests')
            .update({
              claimed_by: 'anybody',
              claimed_at: new Date,
              updated_at: new Date,
            })
            .where('id', prrr.id)

        return Promise.all([
          insertPrrr({
            owner: 'linus',
            repo: 'killall-prrr',
            number: 12,
            requested_by: 'linus',
            created_at: minutesAgo(30),
            updated_at: minutesAgo(30),
          }),
          insertPrrr({
            owner: 'ykatz',
            repo: 'prrr-be-awesome',
            number: 18,
            requested_by: 'ykatz',
            created_at: minutesAgo(25),
            updated_at: minutesAgo(25),
          }),
          insertPrrr({
            owner: 'paulirish',
            repo: 'prrr-rocks',
            number: 18,
            requested_by: 'paulirish',
            created_at: minutesAgo(20),
            updated_at: minutesAgo(20),
          }),
        ])
        .then(_ => queries.getNextPendingPrrr())
        .then( prrr => {
          expect(prrr.repo).to.eql('killall-prrr')
          return markPullRequestAsClaimed(prrr)
        })
        .then(_ => queries.getNextPendingPrrr())
        .then( prrr => {
          expect(prrr.repo).to.eql('prrr-be-awesome')
          return markPullRequestAsClaimed(prrr)
        })
        .then(_ => queries.getNextPendingPrrr())
        .then( prrr => {
          expect(prrr.repo).to.eql('prrr-rocks')
          return markPullRequestAsClaimed(prrr)
        })
        .then(_ => queries.getNextPendingPrrr())
        .then( prrr => {
          expect(prrr).to.be.undefined
        })
      })
    })
  })

  describe('metricsForWeek', () => {

    let queries
    const week = '2017-01-09'

    beforeEach(() => {
      queries = new Queries

      const insertPrrr = attributes =>
        knex
          .insert(attributes)
          .into('pull_request_review_requests')

      return Promise.all([
        insertPrrr({
          id: 33,
          owner: 'anasauce',
          repo: 'prrr-so-meta',
          number: 45,
          requested_by: 'anasauce',
          claimed_by: 'deadlyicon',
          claimed_at:   moment('2017-01-09 11:52:08.244-08').toDate(),
          created_at:   moment('2017-01-09 09:52:08.244-08').toDate(),
          updated_at:   moment('2017-01-09 17:38:54.803-08').toDate(),
          completed_at: moment('2017-01-09 12:52:08.244-08').toDate(),
        }),
        insertPrrr({
          id: 34,
          owner: 'ykatz',
          repo: 'prrr-be-awesome',
          number: 35,
          requested_by: 'DianaVashti',
          claimed_by: 'peterparker',
          claimed_at:   moment('2017-01-09 11:52:08.244-08').toDate(),
          created_at:   moment('2017-01-09 09:52:08.244-08').toDate(),
          updated_at:   moment('2017-01-09 17:38:54.803-08').toDate(),
          completed_at: moment('2017-01-09 12:52:08.244-08').toDate(),
        }),
      ])
    })

    it('Week: should return the correct week', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.week).to.be.a('string')
          expect(results.week).to.eql('2017-01-09')
        })
    })

    it('Total Code Reviews: should return number of total code reviews', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.totalCodeReviews).to.be.a('number')
          expect(results.totalCodeReviews).to.eql(2)
        })
    })

    it('Total Code Reviews Per Reviewer: should return an object of key pair values', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.totalCodeReviewsPerReviewer).to.be.a('object')
          expect(results.totalCodeReviewsPerReviewer).to.eql({deadlyicon: 1, peterparker: 1})
        })
    })

    it('Average Time for Prrr to be Claimed: should return average time', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.averageTimeForPrrrToBeClaimed).to.be.a('number')
          expect(results.averageTimeForPrrrToBeClaimed).to.eql(7200000)
        })
    })

    it('Average Time for Prrr to be Completed: should return average time', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.averageTimeForPrrrToBeCompleted).to.be.a('number')
          expect(results.averageTimeForPrrrToBeCompleted).to.eql(3600000)
        })
    })

    it('Total Number of Project Reviews: should return total number', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.totalNumberOfProjectsThatRequestedReviews).to.be.a('number')
          expect(results.totalNumberOfProjectsThatRequestedReviews).to.eql(2)
        })
    })

    it('Average Number of Reviews Requested Per Project: should return average number', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.averageNumberOfReviewsRequestedPerProject).to.be.a('number')
          expect(results.averageNumberOfReviewsRequestedPerProject).to.eql(1)
        })
    })

    it('Prrrs: should resolve with all Prrs from a specific week', () => {
      return queries.metricsForWeek(week)
        .then(results => {
          expect(results.prrrs).to.be.an('array')
        })
    })

  })
})
