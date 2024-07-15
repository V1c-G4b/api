import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'

const querySchema = z.object({
  page: z.string().optional().default('1'),
  pageSize: z.string().optional().default('10'),
  sortField: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  title: z.string().optional(),
  status: z.enum(['COMPLETED', 'IN_PROGRESS', 'PENDING']).optional(),
})

export async function getTasks(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/tasks',
    {
      schema: {
        tags: ['Tasks'],
        summary: 'Get all tasks',
        description: 'This endpoint allows you to retrieve all tasks with pagination, sorting, and filtering by title or status.',
        querystring: querySchema,
      },
    },
    async (request) => {
      const user = await request.jwtVerify<{ sub: string }>()
      const userId = user.sub
      const { page, pageSize, sortField, sortOrder, title, status } = request.query

      const skip = (Number(page) - 1) * Number(pageSize)

      const where: Prisma.TaskWhereInput = {
        userId,
        ...(title ? { title: { contains: title, mode: Prisma.QueryMode.insensitive } } : {}),
        ...(status ? { status } : {}),
      }

      const tasks = await prisma.task.findMany({
        skip,
        take: Number(pageSize),
        where,
        orderBy: {
          [sortField]: sortOrder,
        },
      })

      const totalTasks = await prisma.task.count({ where })

      return {
        data: tasks,
        meta: {
          page: Number(page),
          pageSize: Number(pageSize),
          totalTasks,
          totalPages: Math.ceil(totalTasks / Number(pageSize)),
        },
      }
    },
  )
}
