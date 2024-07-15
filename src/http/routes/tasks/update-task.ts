import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const TaskStatus = z.enum(['COMPLETED', 'IN_PROGRESS', 'PENDING'])
const TaskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH'])

const updateTaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  dueDate: z.string().transform((str) => new Date(str)),
  status: TaskStatus,
  priority: TaskPriority.default('MEDIUM'),
  tags: z.array(z.string()).optional(), 
})

export async function updateTask(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    '/tasks/:id',
    {
      schema: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description: 'This endpoint allows you to update a task.',
        params: z.object({
          id: z.string(),
        }),
        body: updateTaskSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { title, description, dueDate, status } = request.body

      try {
        const updatedTask = await prisma.task.update({
          where: { id: id }, 
          data: {
            title,
            description,
            dueDate,
            status,
          },
        })

        return reply.status(200).send(updatedTask)
      } catch (error) {
        if (error.code === 'P2025') {
          return reply.status(404).send({ error: 'Task not found' })
        }
        return reply.status(500).send({ error: 'An error occurred while updating the task', details: error.message })
      }
    }
  )
}
