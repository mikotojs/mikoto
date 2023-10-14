import Fastify from 'fastify'
import fastifyIO from 'fastify-socket.io'
import type { FromSchema } from 'json-schema-to-ts'
import process from 'node:process'

const fastify = Fastify({
  logger: true,
})

fastify.register(fastifyIO, {
  cors: {
    origin: '*',
  },
})

fastify.ready().then(() => {
  fastify.io.on('connection', (socket) => {
    fastify.log.info(`${socket.id} connection`)

    socket.on('disconnect', () => {
      fastify.log.info(`user ${socket.id} disconnected`)
    })

    socket.on('message', (...args) => {
      console.log(...args)
    })
  })
})

const jury = {
  type: 'object',
  properties: {
    cookie: { type: 'string' },
  },
  required: ['cookie'],
} as const

fastify.get('/', () => ({ hello: 'world' }))
fastify.get('/ws', () => {
  fastify.io.emit('hello')
  return 'ok'
})
fastify.post<{ Body: FromSchema<typeof jury> }>('/jury', {
  schema: {
    body: jury,
    response: {
      201: {
        type: 'string',
      },
    },
  },
}, async (request) => {
  try {
    const { jury } = await import('@mikotojs/jury')
    const { juryService } = jury(request.body.cookie, {})
    juryService().catch(err => fastify.log.error(err))
    return {
      code: 0,
    }
  } catch (error) {
    return {
      code: -1,
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
