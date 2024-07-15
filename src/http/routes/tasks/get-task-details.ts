import { prisma } from "@/lib/prisma";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import {z} from 'zod'



export async function getTaskDetails(app: FastifyInstance){
  app.withTypeProvider<ZodTypeProvider>().get(
    '/tasks/:id',
    {
      schema: {
        tags: ['Tasks'],
        summary: 'Get details of a task',
        description: 'This endpoint allows you to get the details of a task.',
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const user = await request.jwtVerify<{sub: string}>()
      const userId = user.sub

      const { id } = request.params

      const taskDetailed = await prisma.task.findUnique({
        where: {
          id: id,
          userId: userId,
        }
      });

      if(!taskDetailed){
        return reply.status(404).send({message: 'Task not found'})
      }

      return {
        data: taskDetailed
      }
    }
  )
}