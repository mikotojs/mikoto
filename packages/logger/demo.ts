import { createLogger } from '.'

const logger = createLogger({})

logger.info('hello', 'world')

let count = 0
const timer = setInterval(() => {
  logger.info(new Date().toLocaleDateString())
  if (count++ > 10) {
    clearInterval(timer)
  }
}, 3000)
