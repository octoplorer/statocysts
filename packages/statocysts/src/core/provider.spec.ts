import type { Transport } from './transport'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineProvider } from './provider'

describe('defineProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should parse params', async () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }

    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        const foo = this.url.searchParams.get('foo') ?? 'default'
        const request = new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            foo,
            title: this.message.title,
            body: this.message.body,
          }),
        })
        return { request }
      },
    })

    expect(testProvider.protocol).toBe('test:')

    await testProvider.send('test://aaa?foo=bar', { title: 'Hello, world!', body: 'Hello, world!' })
    expect(mockTransport.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(mockTransport.send).mock.calls[0][0]
    expect(callArgs.request.url).toBe('https://example.com/')
    expect(callArgs.request.method).toBe('POST')
    expect(await callArgs.request.json()).toEqual({
      foo: 'bar',
      title: 'Hello, world!',
      body: 'Hello, world!',
    })

    await testProvider.send('test://aaa?foo=bar', { title: 'Hello, world!' })
    expect(mockTransport.send).toHaveBeenCalledTimes(2)
    const callArgs2 = vi.mocked(mockTransport.send).mock.calls[1][0]
    expect(await callArgs2.request.json()).toEqual({
      foo: 'bar',
      title: 'Hello, world!',
    })
  })

  it('should parse params with promise parser', async () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }

    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        const foo = this.url.searchParams.get('foo') ?? 'default'
        const request = new Request('https://example.com', {
          method: 'POST',
          body: JSON.stringify({
            foo,
            title: this.message.title,
            body: this.message.body,
          }),
        })
        return { request }
      },
    })

    expect(testProvider.protocol).toBe('test:')

    await testProvider.send('test://aaa?foo=bar', { title: 'Hello, world!', body: 'Hello, world!' })
    expect(mockTransport.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(mockTransport.send).mock.calls[0][0]
    expect(callArgs.request.url).toBe('https://example.com/')
    expect(callArgs.request.method).toBe('POST')
    expect(await callArgs.request.json()).toEqual({
      foo: 'bar',
      title: 'Hello, world!',
      body: 'Hello, world!',
    })
  })

  it('should get the default options', async () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }

    const testProvider = defineProvider('test:', {
      defaultOptions: { foo: 'bar' },
      transport: mockTransport,
      async prepare() {
        return { request: new Request('https://example.com', { method: 'POST' }) }
      },
    })
    expect(testProvider.defaultOptions).toEqual({ foo: 'bar' })
  })

  it('should throw an error if the protocol is not supported', async () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }

    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return { request: new Request('https://example.com', { method: 'POST' }) }
      },
    })

    await expect(testProvider.send(
      'http://aaa?foo=bar',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )).rejects.toThrow('Unexpected protocol "http:"')
  })
})
