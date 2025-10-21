import { config } from 'dotenv'
import { z } from 'zod/v4'

config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number(),
  ADDRESS: z.string(),
  SALT_ROUNDS: z.coerce.number(),
  JWT_SECRET: z.string(),
  JWT_TOKEN_EXPIRE_IN_DAYS: z.coerce.number(),

  OPENAI_API_KEY: z.string(),
  OPENAI_MODEL_ID: z.string(),

  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
})

const { error, data } = envSchema.safeParse(process.env)

if (error) {
  throw new Error(`Invalid environment variables.\n${z.prettifyError(error)}`)
}

export const env = Object.freeze(data)
