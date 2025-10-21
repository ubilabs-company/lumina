import { join } from 'node:path'
import autoLoad from '@fastify/autoload'
import fastifyCors from '@fastify/cors'
import fastifyJwt, { type FastifyJWTOptions } from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { errorHandler, notFoundHandler } from '@/http/errors'
import { env } from '@/utils/env'
import { loggerConfig } from '@/utils/logger'

export const app = fastify({
  logger: loggerConfig[env.NODE_ENV],
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.withTypeProvider<ZodTypeProvider>()

app.setErrorHandler(errorHandler)
app.setNotFoundHandler(notFoundHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Lumina',
      description: 'Simple OpenAI Wrapper',
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
  },
  transform: jsonSchemaTransform,
  transformObject: jsonSchemaTransformObject,
})

app.register(import('@scalar/fastify-api-reference'), {
  routePrefix: '/docs',
  configuration: {
    defaultHttpClient: {
      targetKey: 'node',
      clientKey: 'axios',
    },
  },
})

app.register(fastifyCors)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
} as FastifyJWTOptions)

app.register(autoLoad, {
  dir: join(__dirname, 'routes'),
  dirNameRoutePrefix: false,
})
