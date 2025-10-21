import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  type FastifyZodInstance,
  hasZodFastifySchemaValidationErrors,
} from 'fastify-type-provider-zod'
import {
  ApiError,
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '.'

type FastifyErrorHandler = FastifyZodInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply
      .status(400)
      .send(
        new BadRequestError(
          'One or more fields in your request are invalid. Please check the `issues` array for more details',
        ).format(request.url, error.validation),
      )
  }

  if (error instanceof ApiError) {
    return reply.status(error.status).send(error.format(request.url))
  }

  console.error(error)
  return reply
    .status(500)
    .send(
      new InternalServerError(
        'An unexpected server error prevented the request from being completed.',
      ).format(request.url),
    )
}

export const notFoundHandler = (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  return reply
    .status(404)
    .send(
      new NotFoundError(
        `The requested resource '${request.url}' could not be found on this server`,
      ).format(request.url),
    )
}
