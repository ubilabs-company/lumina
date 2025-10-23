import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { FastifyZodInstance } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, tables } from '@/lib/drizzle'
import { env } from '@/utils/env'
import { BadRequestError, UnauthorizedError } from '@/http/errors'

export default async function authenticateWithPassword(
  app: FastifyZodInstance,
) {
  app.post('/sessions/password', {
    schema: {
      tags: ['Auth'],
      summary: 'Authenticate with e-mail & password.',
      operationId: 'authenticateWithPassword',
      body: z.object({
        email: z.email().meta({ example: 'john.doe@example.com' }),
        password: z.string().meta({ example: '123456' }),
      }),
      response: {
        201: z.object({
          token: z.jwt(),
        }),
        [BadRequestError.status]: BadRequestError.schema,
        [UnauthorizedError.status]: UnauthorizedError.schema,
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body

      const userFromEmail = await db.query.users.findFirst({
        where: eq(tables.users.email, email),
      })

      if (!userFromEmail) {
        throw new UnauthorizedError('Invalid credentials')
      }

      if (userFromEmail.passwordHash === null) {
        throw new UnauthorizedError('Invalid credentials')
      }

      const isPasswordValid = await compare(
        password,
        userFromEmail.passwordHash,
      )

      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials')
      }

      const token = await reply.jwtSign(
        {
          sub: userFromEmail.id,
        },
        {
          sign: {
            expiresIn: `${env.JWT_TOKEN_EXPIRE_IN_DAYS}d`,
          },
        },
      )

      return reply.status(201).send({ token })
    },
  })
}