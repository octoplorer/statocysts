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

  it('validates synchronously and reuses validated state without transport side effects', async () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }
    const validate = vi.fn((ctx: { url: URL }, options: { prefix?: string, suffix?: string }) => ({
      foo: ctx.url.searchParams.get('foo') ?? 'default',
      label: `${options.prefix}:${options.suffix}`,
    }))
    const prepare = vi.fn(async (ctx: {
      message: { title: string }
      validated: { foo: string, label: string }
    }) => ({
      request: new Request('https://example.com', {
        method: 'POST',
        body: JSON.stringify({
          ...ctx.validated,
          title: ctx.message.title,
        }),
      }),
    }))

    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      defaultOptions: { prefix: 'default', suffix: 'value' } as {
        prefix?: string
        suffix?: string
      },
      validate,
      prepare,
    })

    const validatedTarget = testProvider.validate('test://target?foo=bar', {
      prefix: 'custom',
    })

    expect(validate).toHaveBeenCalledOnce()
    expect(validate).toHaveBeenCalledWith(expect.objectContaining({
      url: new URL('test://target?foo=bar'),
    }), { prefix: 'custom', suffix: 'value' })
    expect(prepare).not.toHaveBeenCalled()
    expect(mockTransport.send).not.toHaveBeenCalled()

    await validatedTarget.send({ title: 'First' })
    await validatedTarget.send({ title: 'Second' })

    expect(validate).toHaveBeenCalledOnce()
    expect(prepare).toHaveBeenCalledTimes(2)
    expect(mockTransport.send).toHaveBeenCalledTimes(2)

    const firstRequest = vi.mocked(mockTransport.send).mock.calls[0][0].request
    const secondRequest = vi.mocked(mockTransport.send).mock.calls[1][0].request
    await expect(firstRequest.json()).resolves.toEqual({
      foo: 'bar',
      label: 'custom:value',
      title: 'First',
    })
    await expect(secondRequest.json()).resolves.toEqual({
      foo: 'bar',
      label: 'custom:value',
      title: 'Second',
    })
  })

  it('rejects invalid targets synchronously before preparation', () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }
    const prepare = vi.fn(async () => ({
      request: new Request('https://example.com'),
    }))
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      validate(ctx) {
        if (ctx.url.hostname !== 'valid') {
          throw new Error('Invalid provider target')
        }
      },
      prepare,
    })

    expect(() => testProvider.validate('not a url')).toThrow(TypeError)
    expect(() => testProvider.validate('http://valid')).toThrow('Unexpected protocol "http:"')
    expect(() => testProvider.validate('test://invalid')).toThrow('Invalid provider target')
    expect(prepare).not.toHaveBeenCalled()
    expect(mockTransport.send).not.toHaveBeenCalled()
  })

  it('validates notifications on a validated target before preparation', async () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }
    const prepare = vi.fn(async () => ({
      request: new Request('https://example.com'),
    }))
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      prepare,
    })
    const validatedTarget = testProvider.validate('test://target')

    await expect(validatedTarget.send({ title: '   ' })).rejects.toThrow(TypeError)
    expect(prepare).not.toHaveBeenCalled()
    expect(mockTransport.send).not.toHaveBeenCalled()
  })

  it('delegates direct sends through the validation lifecycle', async () => {
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockResolvedValue(undefined),
    }
    const validate = vi.fn(() => ({ endpoint: 'https://example.com' }))
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      validate,
      async prepare(ctx) {
        return { request: new Request(ctx.validated.endpoint) }
      },
    })

    await testProvider.send('test://target', { title: 'Alert' })

    expect(validate).toHaveBeenCalledOnce()
    expect(mockTransport.send).toHaveBeenCalledOnce()
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

  it.each([
    undefined,
    { title: '' },
    { title: '   ' },
    { title: 'Hello', body: 1 },
  ])('should reject invalid notification %#', async (notification) => {
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
      'test://example.com',
      notification as never,
    )).rejects.toThrow(TypeError)
    expect(mockTransport.send).not.toHaveBeenCalled()
  })

  it('should preserve a direct provider failure', async () => {
    const cause = new Error('transport failed')
    const mockTransport: Transport<{ request: Request }> = {
      send: vi.fn().mockRejectedValue(cause),
    }

    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return { request: new Request('https://example.com', { method: 'POST' }) }
      },
    })

    await expect(testProvider.send(
      'test://example.com',
      { title: 'Alert' },
    )).rejects.toBe(cause)
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
