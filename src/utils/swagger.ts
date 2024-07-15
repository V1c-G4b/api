import { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export const setupSwagger = (app: FastifyInstance) => {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Next.js SaaS',
        description: 'Full-stack Todo-List',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{
        bearerAuth: []
      }],
      servers: [],
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
  })
}
