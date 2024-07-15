import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

export async function deleteTask(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/tasks/:taskId',
    {
      schema: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        description: 'This endpoint allows you to delete a task by its ID.',
        params: z.object({
          taskId: z.string().regex(/^\d+$/, 'ID must be a numeric string'), 
        }),
      },
    },
    async (request, reply) => {
      const { taskId } = request.params

      try {
        const deletedTask = await prisma.task.delete({
          where: { id: taskId },
        })

        return reply.status(200).send(deletedTask)
      } catch (error) {
        if (error.code === 'P2025') {
          // Prisma error code for "Record to delete not found."
          return reply.status(404).send({ error: 'Task not found' })
        }
        return reply.status(500).send({ error: 'An error occurred while deleting the task', details: error.message })
      }
    }
  )
}
