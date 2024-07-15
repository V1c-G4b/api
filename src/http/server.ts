import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { ZodTypeProvider, jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'
import { errorHandler } from '@/utils/error.handler'
import { setupSwagger } from '@/utils/swagger'
import { auth } from './middlewares/auth'
import { registerAuthRoutes } from './routes/auth'
import { registerTaskRoutes } from './routes/tasks'

const app = fastify().withTypeProvider<ZodTypeProvider>()

// Configure compiler for fastify-type-provider-zod
app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

// Error Handler
app.setErrorHandler(errorHandler)

// Register Plugins
app.register(fastifyJwt, { secret: 'my-jwt-secret' })
app.register(fastifyCors)

// Register Middleware
app.register(auth)

// Setup Swagger
setupSwagger(app)

// Register Routes
registerAuthRoutes(app)
registerTaskRoutes(app)

// Start Server
app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running!')
})
