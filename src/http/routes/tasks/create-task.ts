import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

const TaskStatus = z.enum(['COMPLETED', 'IN_PROGRESS', 'PENDING'])
const TaskPriority = z.enum(['LOW', 'MEDIUM', 'HIGH'])

const createTaskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  dueDate: z.string().transform((str) => new Date(str)),
  status: TaskStatus,
  priority: TaskPriority.default('MEDIUM'),
  tags: z.array(z.string()).optional(), 
})

export async function createTask(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/tasks',
    {
      schema: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        description: 'This endpoint allows you to create a new task.',
        body: createTaskSchema,
      },
    },
    async (request, reply) => {
      try {
        const user = await request.jwtVerify<{ sub: string }>()
        const userId = user.sub

        const { title, description, dueDate, status, priority, tags } = request.body

        const tagRecords = tags ? await Promise.all(tags.map(async (tag) => {
          return await prisma.tag.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag },
          })
        })) : []

        const newTask = await prisma.task.create({
          data: {
            title,
            description,
            dueDate,
            status,
            priority,
            userId,
            tags: {
              create: tagRecords.map(tag => ({
                tagId: tag.id,
              })),
            },
          },
        })

        return reply.status(201).send({
          message: 'Task created successfully',
          task: newTask,
        })
      } catch (error) {
        console.error('Error creating task:', error)
        return reply.status(500).send({
          message: 'An error occurred while creating the task',
          error: error.message,
        })
      }
    }
  )
}
