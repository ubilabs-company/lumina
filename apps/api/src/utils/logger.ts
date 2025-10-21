import type { PinoLoggerOptions } from 'fastify/types/logger'

export const loggerConfig = {
  development: {
    level: 'DEBUG',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  } satisfies PinoLoggerOptions,
  production: true,
  test: false,
}
