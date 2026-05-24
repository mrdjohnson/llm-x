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

export const setServerPostResponse = <T>(url: string, response: (body: T) => Promise<object>) => {
  server.use(
    http.post(url, async ({ request }) => {
      const json = (await request.json()) as T

      return HttpResponse.json(await response(json))
    }),
  )
}
