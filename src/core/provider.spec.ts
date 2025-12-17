import { describe, expect, it, vi } from "vitest";
import { defineProvider } from "./provider";

describe('defineProvider', () => {
  vi.spyOn(globalThis, 'fetch')
    .mockImplementation(async () => new Response('ok', { status: 200 }))

  it('should parse params', async () => {
    const testProvider = defineProvider('test:', {
      extractor() {
        return { foo: "bar" }
      },
      parser: (data) => data as { foo: string },
      createRequest: (params) => new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    })

    expect(testProvider.protocol).toBe('test:')

    const response = await testProvider.send('test://aaa?foo=bar', "Hello, world!") 
    expect(response).toEqual( 'ok' )
  })
})
