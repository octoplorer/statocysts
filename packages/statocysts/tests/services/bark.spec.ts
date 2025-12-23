import type { FetchOptions } from 'ofetch'
import { bark } from '#/index'
import { describe, expect, it } from 'vitest'

describe('bark integration test', () => {
  it.skipIf(process.env.VITE_BARK_TEST_URL === undefined)(
    'should send a simple message to bark',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            code: 200,
            message: 'success',
            data: expect.arrayContaining([
              expect.objectContaining({
                device_key: expect.any(String),
                code: 200,
              }),
            ]),
            timestamp: expect.any(Number),
          }))
        },
      }
      await bark.send(
        process.env.VITE_BARK_TEST_URL!,
        { title: 'Hello, world!' },
        { fetchOptions },
      )
    },
  )
})
