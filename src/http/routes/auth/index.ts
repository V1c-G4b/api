import { FastifyInstance } from 'fastify'
import { createAccount } from './create-account'
import { authenticateWithPassword } from './login'

export const registerAuthRoutes = (app: FastifyInstance) => {
  app.register(createAccount)
  app.register(authenticateWithPassword)
}
