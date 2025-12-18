import { httpTransport } from '#/core/transports/http'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { json } from './index'

// Mock httpTransport
vi.mock('#/core/transports/http', () => ({
  httpTransport: {
    send: vi.fn(),
  },
}))

describe('json provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request without query parameters', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    expect(httpTransport.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.url).toBe('https://api.example.com/webhook')
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(await request.json()).toEqual({
      title: 'Hello, world!',
      body: 'Hello, world!',
    })
  })

  it('should build a request with headers and body properties', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?+Authorization=Bearer+token123&:title=Alert&:priority=high',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.url).toBe('https://api.example.com/webhook')
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(request.headers.get('Authorization')).toBe('Bearer token123')
    expect(await request.json()).toEqual({
      title: 'Alert',
      priority: 'high',
      body: 'Hello, world!',
    })
  })

  it('should build a request with multiple headers and properties', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://example.com/api?+Authorization=Bearer+abc&+X-Custom-Header=value&:key1=val1&:key2=val2',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.url).toBe('https://example.com/api')
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(request.headers.get('Authorization')).toBe('Bearer abc')
    expect(request.headers.get('X-Custom-Header')).toBe('value')
    expect(await request.json()).toEqual({
      key1: 'val1',
      key2: 'val2',
      title: 'Hello, world!',
      body: 'Hello, world!',
    })
  })

  it('should decode spaces in header values (encoded as +)', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?+Authorization=Bearer+token+with+spaces',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.headers.get('Authorization')).toBe('Bearer token with spaces')
  })

  it('should ignore parameters without prefix', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?normalParam=value&:bodyParam=bodyValue',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.headers.has('normalParam')).toBe(false)
    expect(await request.json()).toEqual({
      title: 'Hello, world!',
      bodyParam: 'bodyValue',
      body: 'Hello, world!',
    })
  })

  it('should handle URL-encoded values in headers', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?+X-Custom-Header=value%20with%20encoded%20spaces',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.headers.get('X-Custom-Header')).toBe('value with encoded spaces')
  })

  it('should handle URL-encoded values in body properties', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?:title=Alert%20Message&:priority=high',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(await request.json()).toEqual({
      title: 'Alert Message',
      priority: 'high',
      body: 'Hello, world!',
    })
  })

  it('should handle empty query string', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.url).toBe('https://api.example.com/webhook?')
    expect(request.method).toBe('POST')
    expect([...request.headers.values()].length).toEqual(1)
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(await request.json()).toEqual({
      title: 'Hello, world!',
      body: 'Hello, world!',
    })
  })

  it('should handle path with multiple segments', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/v1/webhooks/notifications',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.url).toBe('https://api.example.com/v1/webhooks/notifications')
  })

  it('should handle special characters in body property values', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?:title=Special%3A%20chars&:number=123',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(await request.json()).toEqual({
      title: 'Special: chars',
      number: '123',
      body: 'Hello, world!',
    })
  })

  it('should override the headers if has same key', async () => {
    vi.mocked(httpTransport.send).mockResolvedValue(undefined)

    await json.send(
      'json://api.example.com/webhook?+Authorization=Bearer+token123&+Authorization=Bearer+token456',
      { title: 'Hello, world!', body: 'Hello, world!' },
    )

    const callArgs = vi.mocked(httpTransport.send).mock.calls[0][0]
    const request = callArgs.request
    expect(request.headers.get('Authorization')).toBe('Bearer token456')
  })
})
