import { jury } from '@mikotojs/jury'
import Fastify from 'fastify'
import process from 'node:process'

const fastify = Fastify({
  logger: true,
})

fastify.get('/', () => ({ hello: 'world' }))
fastify.get<{
  Querystring: { cookie: string }
}>('/jury', async (request) => {
  const cookie = request.query.cookie
  try {
    const { juryService } = jury(cookie, {})
    await juryService()
    return {
      demo: request.query,
    }
  } catch (error) {
    return {
      error: error.message,
    }
  }
})

async function main() {
  // Run the server!
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

main()
