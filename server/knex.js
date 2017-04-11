import Knex from 'knex'
import chalk from 'chalk'
import logger from './logger'
const config = require('../../knexfile')[process.env.NODE_ENV]
const knex = Knex(config)


knex.client.on('start', builder => {
  builder.on('query', query => {
    logger.debug('%s %s %s',
      chalk.gray('SQL'),
      chalk.cyan(query.sql),
      chalk.gray(JSON.stringify(query.bindings)),
    )
  })
});

export default knex
