import { app } from '@/http/server'
import { env } from '@/utils/env'

app.listen({ port: env.PORT }, err => {
  if (err) {
    app.log.error(err)
  }

  const url = `http://${env.ADDRESS}:${env.PORT}`
  app.log.info(`Access API documentation at ${url}/docs`)
})
