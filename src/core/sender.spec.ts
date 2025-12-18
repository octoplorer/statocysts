import { ofetch } from 'ofetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineProvider } from './provider'

import { buildSenderRegistry } from './sender'

// Mock ofetch
vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}))

describe('buildSenderRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a sender registry with resolveProvider method', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    const registry = buildSenderRegistry([testProvider])

    expect(typeof registry).toBe('function')
    expect(typeof registry.resolveProvider).toBe('function')
  })

  it('should resolve provider by protocol from string URL', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider('test://example.com')

    expect(resolved).toBe(testProvider)
  })

  it('should resolve provider by protocol from URL object', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider(new URL('test://example.com'))

    expect(resolved).toBe(testProvider)
  })

  it('should return undefined for unsupported protocol', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    const registry = buildSenderRegistry([testProvider])
    const resolved = registry.resolveProvider('http://example.com')

    expect(resolved).toBeUndefined()
  })

  it('should return undefined for URL without protocol', () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    const registry = buildSenderRegistry([testProvider])
    // Create a URL without protocol by using a relative URL
    const urlWithoutProtocol = new URL('//example.com', 'file://')
    urlWithoutProtocol.protocol = ''

    const resolved = registry.resolveProvider(urlWithoutProtocol)

    expect(resolved).toBeUndefined()
  })

  it('should create a sender that sends messages to all registered URLs', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    vi.mocked(ofetch).mockResolvedValue(undefined)

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com', 'test://another.com'])

    await sender.send('Hello, world!')

    expect(ofetch).toHaveBeenCalledTimes(2)
    expect(vi.mocked(ofetch).mock.calls[0][0]).toBeInstanceOf(Request)
    expect(vi.mocked(ofetch).mock.calls[1][0]).toBeInstanceOf(Request)
  })

  it('should filter out URLs without matching providers', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    vi.mocked(ofetch).mockResolvedValue(undefined)

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com', 'http://unsupported.com'])

    await sender.send('Hello, world!')

    // Should only call ofetch once for the supported protocol
    expect(ofetch).toHaveBeenCalledTimes(1)
  })

  it('should pass FetchOptions to ofetch', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    vi.mocked(ofetch).mockResolvedValue(undefined)

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['test://example.com'])

    const options = { headers: { 'X-Custom': 'value' } }
    await sender.send('Hello, world!', options)

    expect(ofetch).toHaveBeenCalledTimes(1)
    expect(vi.mocked(ofetch).mock.calls[0][1]).toEqual(options)
  })

  it('should handle multiple providers with different protocols', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    const httpProvider = defineProvider('http:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    vi.mocked(ofetch).mockResolvedValue(undefined)

    const registry = buildSenderRegistry([testProvider, httpProvider])
    const sender = registry(['test://example.com', 'http://another.com'])

    await sender.send('Hello, world!')

    expect(ofetch).toHaveBeenCalledTimes(2)
  })

  it('should handle empty URLs array', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    vi.mocked(ofetch).mockResolvedValue(undefined)

    const registry = buildSenderRegistry([testProvider])
    const sender = registry([])

    await sender.send('Hello, world!')

    expect(ofetch).not.toHaveBeenCalled()
  })

  it('should handle sender with no valid providers', async () => {
    const testProvider = defineProvider('test:', {
      extractor: () => ({}),
      createRequest: () => new Request('https://example.com', { method: 'POST' }),
    })

    vi.mocked(ofetch).mockResolvedValue(undefined)

    const registry = buildSenderRegistry([testProvider])
    const sender = registry(['http://unsupported.com', 'https://also-unsupported.com'])

    await sender.send('Hello, world!')

    expect(ofetch).not.toHaveBeenCalled()
  })
})
