import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const server = setupServer()

export const setServerResponse = (url: string, body: object) => {
  server.use(
    http.all(url, () => {
      return HttpResponse.json(body)
    }),
  )
}
