import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const authenticateWithPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Authenticate with e-mail & password',
        body: authenticateWithPasswordSchema,
        response: {
          200: z.object({
            token: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        reply.status(400).send({ message: 'Invalid email or password' })
        return
      }

      const isPasswordValid = await compare(password, user.password)
      if (!isPasswordValid) {
        reply.status(400).send({ message: 'Invalid email or password' })
        return
      }

      const token = app.jwt.sign({ sub: user.id })

      reply.send({ token })
    }
  )
}
