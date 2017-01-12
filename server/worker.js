import './environment'
import Commands from './commands'

new Commands().unclaimStalePrrrs()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
