describe('Queries', function(){

  describe('getPrrrs', function(){
    it('should resolve with all Prrrs', function(){
      const queries = new Queries

      return queries.getPrrrs()
        .then(prrrs => {
          console.log('herererererererer', prrrs)
          expect(prrrs).to.be.an('array')
          // expect(prrrs.from).to.eql('pull_request_review_requests')
        })
    })
  })

  describe('getPrrrById', function(){
    it('should take a Prrr Id and return a Prrr', function(){
      const queries = new Queries

      return queries.getPrrrById(1)
        .then(prrr => {
          console.log('herererererererer', prrr)
          expect(prrr.owner).to.eql('GuildCrafts')
        })
    })
  })


})
