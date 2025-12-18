import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineProvider } from './provider'

import { buildSenderRegistry } from './sender'

describe('buildSenderRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a sender registry with resolveProvider method', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        // Mock send implementation
      },
    })

    const registry = buildSenderRegistry([testProvider])

    expect(typeof registry).toBe('function')
    expect(typeof registry.resolveProvider).toBe('function')
  })

  it('should resolve provider by protocol from string URL', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        // Mock send implementation
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider('test://example.com')

    expect(resolved).toBe(testProvider)
  })

  it('should resolve provider by protocol from URL object', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        // Mock send implementation
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider(new URL('test://example.com'))

    expect(resolved).toBe(testProvider)
  })

  it('should return undefined for unsupported protocol', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        // Mock send implementation
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider('http://example.com')

    expect(resolved).toBeUndefined()
  })

  it('should return undefined for URL without protocol', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        // Mock send implementation
      },
    })

    const registry = buildSenderRegistry([testProvider])
    // Create a URL without protocol by using a relative URL
    const urlWithoutProtocol = new URL('//example.com', 'file://')
    urlWithoutProtocol.protocol = ''

    const resolved = registry.resolveProvider(urlWithoutProtocol)

    expect(resolved).toBeUndefined()
  })

  it('should create a sender that sends messages to all registered URLs', async () => {
    const sendMock = vi.fn().mockResolvedValue(undefined)
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        await sendMock()
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com', 'test://another.com'])

    await sender.send('Hello, world!')

    expect(sendMock).toHaveBeenCalledTimes(2)
  })

  it('should filter out URLs without matching providers', async () => {
    const sendMock = vi.fn().mockResolvedValue(undefined)
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        await sendMock()
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com', 'http://unsupported.com'])

    await sender.send('Hello, world!')

    // Should only call send once for the supported protocol
    expect(sendMock).toHaveBeenCalledTimes(1)
  })

  it('should pass FetchOptions to provider send', async () => {
    const sendMock = vi.fn().mockResolvedValue(undefined)
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send(ctx, options) {
        await sendMock(ctx.url, ctx.message, options)
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com'])

    const options = { headers: { 'X-Custom': 'value' } }
    await sender.send('Hello, world!', options)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(
      new URL('test://example.com'),
      { title: 'Hello, world!' },
      options,
    )
  })

  it('should handle multiple providers with different protocols', async () => {
    const sendMock1 = vi.fn().mockResolvedValue(undefined)
    const sendMock2 = vi.fn().mockResolvedValue(undefined)
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        await sendMock1()
      },
    })

    const httpProvider = defineProvider('http:', {
      extractor: () => ({}),
      async send() {
        await sendMock2()
      },
    })

    const registry = buildSenderRegistry([testProvider, httpProvider])
    const sender = registry(['test://example.com', 'http://another.com'])

    await sender.send('Hello, world!')

    expect(sendMock1).toHaveBeenCalledTimes(1)
    expect(sendMock2).toHaveBeenCalledTimes(1)
  })

  it('should handle empty URLs array', async () => {
    const sendMock = vi.fn().mockResolvedValue(undefined)
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        await sendMock()
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry([])

    await sender.send('Hello, world!')

    expect(sendMock).not.toHaveBeenCalled()
  })

  it('should handle sender with no valid providers', async () => {
    const sendMock = vi.fn().mockResolvedValue(undefined)
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      async send() {
        await sendMock()
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['http://unsupported.com', 'https://also-unsupported.com'])

    await sender.send('Hello, world!')

    expect(sendMock).not.toHaveBeenCalled()
  })
})
