import type { Transport } from './transport'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineProvider } from './provider'

import { buildSenderRegistry } from './sender'

// Helper to create a mock transport
function createMockTransport() {
  return {
    send: vi.fn().mockResolvedValue(undefined),
  } as Transport<any>
}

describe('buildSenderRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a sender registry with resolveProvider method', () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])

    expect(typeof registry).toBe('function')
    expect(typeof registry.resolveProvider).toBe('function')
  })

  it('should resolve provider by protocol from string URL', () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider('test://example.com')

    expect(resolved).toBe(testProvider)
  })

  it('should resolve provider by protocol from URL object', () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider(new URL('test://example.com'))

    expect(resolved).toBe(testProvider)
  })

  it('should return undefined for unsupported protocol', () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider('http://example.com')

    expect(resolved).toBeUndefined()
  })

  it('should return undefined for URL without protocol', () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
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
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com', 'test://another.com'])

    await sender.send('Hello, world!')

    expect(mockTransport.send).toHaveBeenCalledTimes(2)
  })

  it('should filter out URLs without matching providers', async () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com', 'http://unsupported.com'])

    await sender.send('Hello, world!')

    // Should only call send once for the supported protocol
    expect(mockTransport.send).toHaveBeenCalledTimes(1)
  })

  it('should pass FetchOptions to provider send', async () => {
    const mockTransport = createMockTransport()
    const prepareMock = vi.fn().mockResolvedValue({ url: 'test://example.com' })
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare(ctx, options) {
        prepareMock(ctx.url, ctx.message, options)
        return { url: ctx.url.toString() }
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com'])

    const options = { headers: { 'X-Custom': 'value' } }
    await sender.send('Hello, world!', options)

    expect(prepareMock).toHaveBeenCalledTimes(1)
    expect(prepareMock).toHaveBeenCalledWith(
      new URL('test://example.com'),
      { title: 'Hello, world!' },
      options,
    )
  })

  it('should handle multiple providers with different protocols', async () => {
    const mockTransport1 = createMockTransport()
    const mockTransport2 = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport1,
      async prepare() {
        return {}
      },
    })

    const httpProvider = defineProvider('http:', {
      transport: mockTransport2,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider, httpProvider])
    const sender = registry(['test://example.com', 'http://another.com'])

    await sender.send('Hello, world!')

    expect(mockTransport1.send).toHaveBeenCalledTimes(1)
    expect(mockTransport2.send).toHaveBeenCalledTimes(1)
  })

  it('should handle empty URLs array', async () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry([])

    await sender.send('Hello, world!')

    expect(mockTransport.send).not.toHaveBeenCalled()
  })

  it('should handle sender with no valid providers', async () => {
    const mockTransport = createMockTransport()
    const testProvider = defineProvider('test:', {
      transport: mockTransport,
      async prepare() {
        return {}
      },
    })

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['http://unsupported.com', 'https://also-unsupported.com'])

    await sender.send('Hello, world!')

    expect(mockTransport.send).not.toHaveBeenCalled()
  })
})
