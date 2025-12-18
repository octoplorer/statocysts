import { describe, expect, it } from 'vitest'
import { json } from './index'

describe('json provider', () => {
  it('should build a basic request without query parameters', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook',
      'Hello, world!',
    )
    expect(request.url).toBe('https://api.example.com/webhook')
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(await request.json()).toEqual({
      message: 'Hello, world!',
    })
  })

  it('should build a request with headers and body properties', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?+Authorization=Bearer+token123&:title=Alert&:priority=high',
      'Hello, world!',
    )
    expect(request.url).toBe('https://api.example.com/webhook')
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(request.headers.get('Authorization')).toBe('Bearer token123')
    expect(await request.json()).toEqual({
      title: 'Alert',
      priority: 'high',
      message: 'Hello, world!',
    })
  })

  it('should build a request with multiple headers and properties', async () => {
    const request = json.buildRequest(
      'json://example.com/api?+Authorization=Bearer+abc&+X-Custom-Header=value&:key1=val1&:key2=val2',
      'Hello, world!',
    )
    expect(request.url).toBe('https://example.com/api')
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(request.headers.get('Authorization')).toBe('Bearer abc')
    expect(request.headers.get('X-Custom-Header')).toBe('value')
    expect(await request.json()).toEqual({
      key1: 'val1',
      key2: 'val2',
      message: 'Hello, world!',
    })
  })

  it('should decode spaces in header values (encoded as +)', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?+Authorization=Bearer+token+with+spaces',
      'Hello, world!',
    )
    expect(request.headers.get('Authorization')).toBe('Bearer token with spaces')
  })

  it('should ignore parameters without prefix', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?normalParam=value&:bodyParam=bodyValue',
      'Hello, world!',
    )
    expect(request.headers.has('normalParam')).toBe(false)
    expect(await request.json()).toEqual({
      bodyParam: 'bodyValue',
      message: 'Hello, world!',
    })
  })

  it('should handle URL-encoded values in headers', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?+X-Custom-Header=value%20with%20encoded%20spaces',
      'Hello, world!',
    )
    expect(request.headers.get('X-Custom-Header')).toBe('value with encoded spaces')
  })

  it('should handle URL-encoded values in body properties', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?:title=Alert%20Message&:priority=high',
      'Hello, world!',
    )
    expect(await request.json()).toEqual({
      title: 'Alert Message',
      priority: 'high',
      message: 'Hello, world!',
    })
  })

  it('should handle empty query string', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?',
      'Hello, world!',
    )
    expect(request.url).toBe('https://api.example.com/webhook?')
    expect(request.method).toBe('POST')
    expect([...request.headers.values()].length).toEqual(1)
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(await request.json()).toEqual({
      message: 'Hello, world!',
    })
  })

  it('should handle path with multiple segments', async () => {
    const request = json.buildRequest(
      'json://api.example.com/v1/webhooks/notifications',
      'Hello, world!',
    )
    expect(request.url).toBe('https://api.example.com/v1/webhooks/notifications')
  })

  it('should handle special characters in body property values', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?:title=Special%3A%20chars&:number=123',
      'Hello, world!',
    )
    expect(await request.json()).toEqual({
      title: 'Special: chars',
      number: '123',
      message: 'Hello, world!',
    })
  })

  it('should override the headers if has same key', async () => {
    const request = json.buildRequest(
      'json://api.example.com/webhook?+Authorization=Bearer+token123&+Authorization=Bearer+token456',
      'Hello, world!',
    )
    expect(request.headers.get('Authorization')).toBe('Bearer token456')
  })
})
