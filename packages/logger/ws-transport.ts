import build from 'pino-abstract-transport'
import { io } from 'socket.io-client'

export default async function(_opts) {
  const socket = io('ws://localhost:3000')
  return build(async (source) => {
    for await (const obj of source) {
      socket.send(JSON.stringify(obj))
    }
  }, {
    async close() {
    },
  })
}
