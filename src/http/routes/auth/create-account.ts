import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const createAccountSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Create a new account',
        description: 'This endpoint allows you to create a new account.',
        body: createAccountSchema,
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      try {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
          return reply.status(400).send({
            message: 'User with this email already exists',
          })
        }

        const hashedPassword = await hash(password, 10)

        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        })

        return reply.status(201).send({
          message: 'Account created successfully',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
          },
        })
      } catch (error) {
        console.error('Error creating account:', error)
        return reply.status(500).send({
          message: 'An error occurred while creating the account',
          error: error.message,
        })
      }
    }
  )
}
