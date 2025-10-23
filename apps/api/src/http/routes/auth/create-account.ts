import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { FastifyZodInstance } from 'fastify-type-provider-zod'
import { z } from 'zod/v4'
import { db, tables } from '@/lib/drizzle'
import { env } from '@/utils/env'
import { BadRequestError, ConflictError } from '@/http/errors'

export default async function createAccount(app: FastifyZodInstance) {
  app.post('/users', {
    schema: {
      tags: ['Auth'],
      summary: 'Create a new account.',
      operationId: 'createAccount',
      body: z.object({
        username: z.string().meta({ example: 'John Doe' }),
        email: z.email().meta({ example: 'john.doe@example.com' }),
        password: z.string().min(6).meta({ example: '123456' }),
      }),
      response: {
        201: z.null(),
        [BadRequestError.status]: BadRequestError.schema,
        [ConflictError.status]: ConflictError.schema,
      },
    },
    handler: async (request, reply) => {
      const { username, email, password } = request.body

      const userWithSameEmail = await db.query.users.findFirst({
        where: eq(tables.users.email, email),
      })

      if (userWithSameEmail) {
        throw new ConflictError('A user with the same email already exists')
      }

      const userWithSameUsername = await db.query.users.findFirst({
        where: eq(tables.users.username, username),
      })

      if (userWithSameUsername) {
        throw new ConflictError('A user with the same username already exists')
      }

      const passwordHash = await hash(password, env.SALT_ROUNDS)

      await db
        .insert(tables.users)
        .values({ username, email, passwordHash })

      return reply.status(201).send()
    },
  })
}