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
