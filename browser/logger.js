import logger from 'loglevel'
logger.setLevel(
  process.env.NODE_ENV === 'development' ? 'trace' : 'warn'
)
export default logger
