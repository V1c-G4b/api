import { FastifyInstance } from 'fastify'

export const auth = async (app: FastifyInstance) => {
  app.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })
}
