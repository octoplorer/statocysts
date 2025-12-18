import { describe, expect, it } from "vitest";
import { defineProvider } from "./provider";

describe('defineProvider', () => {
  it('should parse params', async () => {
    const testProvider = defineProvider('test:', {
      extractor() {
        return { foo: "bar" }
      },
      createRequest() {
        return new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            ...this.data,
            message: this.message
          }),
        })
      }
    })

    expect(testProvider.protocol).toBe('test:')

    const request = testProvider.buildRequest('test://aaa?foo=bar', "Hello, world!")
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
      createRequest() {
        return new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            ...this.data,
            message: this.message
          }),
        })
      }
    })

    expect(testProvider.protocol).toBe('test:')

    const request = testProvider.buildRequest('test://aaa?foo=bar', "Hello, world!")
    expect(request.url).toBe('https://example.com/')
    expect(request.method).toBe('POST')
    expect(await request.json()).toEqual({
      foo: "bar",
      message: "Hello, world!",
    })
  })

  it('should get the default options', async () => {
    const testProvider = defineProvider('test:', {
      defaultOptions: { foo: 'bar' },
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })
    expect(testProvider.defaultOptions).toEqual({ foo: 'bar' })
  })

  it('should throw an error if the protocol is not supported', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    await expect(testProvider.buildRequest('http://aaa?foo=bar', "Hello, world!")).rejects.toThrow('Unexpected protocol "http:"')
  })
})
