import { describe, expect, it } from "vitest";
import { defineProvider } from "./provider";

describe('defineProvider', () => {
  it('should parse params', async () => {
    const testProvider = defineProvider('test:', {
      extractor() {
        return { foo: "bar" }
      },
      parser: (data) => data as { foo: string },
      createRequest(params) {
        return new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            ...params,
            message: this.message
          }),
        })
      }
    })

    expect(testProvider.protocol).toBe('test:')

    const request = await testProvider.buildRequest('test://aaa?foo=bar', "Hello, world!")
    expect(request.url).toBe('https://example.com/')
    expect(request.method).toBe('POST')
    expect(await request.json()).toEqual({
      foo: "bar",
      message: "Hello, world!",
    })
  })

  it('should parse params with promise parser', async () => {
    const testProvider = defineProvider('test:', {
      extractor() {
        return { foo: "bar" }
      },
      parser: async (data) => data as { foo: string },
      createRequest(params) {
        return new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            ...params,
            message: this.message
          }),
        })
      }
    })

    expect(testProvider.protocol).toBe('test:')

    const request = await testProvider.buildRequest('test://aaa?foo=bar', "Hello, world!")
    expect(request.url).toBe('https://example.com/')
    expect(request.method).toBe('POST')
    expect(await request.json()).toEqual({
      foo: "bar",
      message: "Hello, world!",
    })
  })

  it('should throw an error if the protocol is not supported', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      parser: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    await expect(testProvider.buildRequest('http://aaa?foo=bar', "Hello, world!")).rejects.toThrow('Unexpected protocol "http:"')
  })
})
