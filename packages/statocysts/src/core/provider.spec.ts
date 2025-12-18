import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineProvider } from './provider'
import { httpTransport } from './transports/http'

// Mock httpTransport
vi.mock('./transports/http', () => ({
  httpTransport: {
    send: vi.fn(),
  },
}))

describe('defineProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse params', async () => {
    const testProvider = defineProvider('test:', {
      extractor() {
        return { foo: 'bar' }
      },
      async send() {
        const request = new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            ...this.data,
            title: this.message.title,
            body: this.message.body,
          }),
        })
        await httpTransport.send({ request })
      },
    })

    expect(testProvider.protocol).toBe('test:')

    await testProvider.send('test://aaa?foo=bar', { title: 'Hello, world!', body: 'Hello, world!' })
    expect(vi.mocked(httpTransport.send)).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    expect(callArgs.request.url).toBe('https://example.com/')
    expect(callArgs.request.method).toBe('POST')
    expect(await callArgs.request.json()).toEqual({
      foo: 'bar',
      title: 'Hello, world!',
      body: 'Hello, world!',
    })

    await testProvider.send('test://aaa?foo=bar', { title: 'Hello, world!' })
    expect(vi.mocked(httpTransport.send)).toHaveBeenCalledTimes(2)
    const callArgs2 = vi.mocked(httpTransport.send).mock.calls[1][0]
    expect(await callArgs2.request.json()).toEqual({
      foo: 'bar',
      title: 'Hello, world!',
    })
  })

  it('should parse params with promise parser', async () => {
    const testProvider = defineProvider('test:', {
      extractor() {
        return { foo: 'bar' }
      },
      async send() {
        const request = new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            ...this.data,
            title: this.message.title,
            body: this.message.body,
          }),
        })
        await httpTransport.send({ request })
      },
    })

    expect(testProvider.protocol).toBe('test:')

    await testProvider.send('test://aaa?foo=bar', { title: 'Hello, world!', body: 'Hello, world!' })
    expect(vi.mocked(httpTransport.send)).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    expect(callArgs.request.url).toBe('https://example.com/')
    expect(callArgs.request.method).toBe('POST')
    expect(await callArgs.request.json()).toEqual({
      foo: 'bar',
      title: 'Hello, world!',
      body: 'Hello, world!',
    })
  })

  it('should get the default options', async () => {
    const testProvider = defineProvider('test:', {
      defaultOptions: { foo: 'bar' },
      extractor: () => ({}),
      async send() {
        await httpTransport.send({ request: new Request('https://example.com', { method: 'POST' }) })
      },
    })
    expect(testProvider.defaultOptions).toEqual({ foo: 'bar' })
  })

  it('should throw an error if the protocol is not supported', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        await httpTransport.send({ request: new Request('https://example.com', { method: 'POST' }) })
      },
    })

    await expect(testProvider.send(
      'http://aaa?foo=bar',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )).rejects.toThrow('Unexpected protocol "http:"')
  })
})
