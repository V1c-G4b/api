import { FastifyInstance } from 'fastify'
import { createTask } from './create-task'
import { getTasks } from './get-task'
import { updateTask } from './update-task'
import { deleteTask } from './delete-task'
import { getTaskDetails } from './get-task-details'

export const registerTaskRoutes = (app: FastifyInstance) => {
  app.register(createTask)
  app.register(getTasks)
  app.register(updateTask)
  app.register(deleteTask)
  app.register(getTaskDetails)
}
