exports.up = knex =>
  knex.schema.createTable('skipped_prrrs', table => {
    table.integer('prrr_id').notNullable()
    table.string('github_username').notNullable()
    table.timestamp('skipped_at').notNullable()
    table.unique(['prrr_id', 'github_username'])
  })

exports.down = knex =>
  knex.schema.dropTable('skipped_prrrs')
