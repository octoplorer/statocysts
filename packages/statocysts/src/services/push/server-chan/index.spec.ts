import { http } from '#/core/transports/http'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { serverChan } from '.'

// Mock httpTransport
vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

describe('server-chan v3', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request with title only', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://testuid:sctp1234567890abcdefghijklmnopqr@v3',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://testuid.push.ft07.com/send/sctp1234567890abcdefghijklmnopqr.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Hello, world!',
    })
  })

  it('should build a request with title and body', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://testuid:sctp1234567890abcdefghijklmnopqr@v3',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://testuid.push.ft07.com/send/sctp1234567890abcdefghijklmnopqr.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Test Title',
      desp: 'This is the message body',
    })
  })

  it('should handle single tag parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://testuid:sctp1234567890abcdefghijklmnopqr@v3?tags=urgent',
      { title: 'Alert' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Alert',
      tags: 'urgent',
    })
  })

  it('should handle multiple tags parameters', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://testuid:sctp1234567890abcdefghijklmnopqr@v3?tags=urgent&tags=alert&tags=system',
      { title: 'Multiple Tags' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Multiple Tags',
      tags: 'urgent|alert|system',
    })
  })

  it('should handle short parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://testuid:sctp1234567890abcdefghijklmnopqr@v3?short=Brief description',
      { title: 'Test', body: 'Long message content' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      desp: 'Long message content',
      short: 'Brief description',
    })
  })

  it('should handle both tags and short parameters', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://testuid:sctp1234567890abcdefghijklmnopqr@v3?tags=urgent&tags=alert&short=Quick summary',
      { title: 'Alert', body: 'Detailed alert message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Alert',
      desp: 'Detailed alert message',
      tags: 'urgent|alert',
      short: 'Quick summary',
    })
  })

  it('should throw an error if UID is missing', async () => {
    await expect(serverChan.send(
      'server-chan://:sctp1234567890abcdefghijklmnopqr@v3',
      { title: 'Hello, world!' },
    )).rejects.toThrow('UID is required for Server Chan 3')
  })

  it('should throw an error if sendKey is missing', async () => {
    await expect(serverChan.send(
      'server-chan://testuid:@v3',
      { title: 'Hello, world!' },
    )).rejects.toThrow('SendKey is required for Server Chan 3')
  })
})

describe('server-chan turbo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request with title only', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://sctapi.ftqq.com/SCT123456abcdefghijklmnopqrstuvwxy.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Hello, world!',
    })
  })

  it('should build a request with title and body', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://sctapi.ftqq.com/SCT123456abcdefghijklmnopqrstuvwxy.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Test Title',
      desp: 'This is the message body',
    })
  })

  it('should handle short parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?short=Brief',
      { title: 'Test' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      short: 'Brief',
    })
  })

  it('should handle noip parameter with value "1"', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?noip=1',
      { title: 'Test' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      noip: 1,
    })
  })

  it('should handle noip parameter with value "true"', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?noip=true',
      { title: 'Test' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      noip: 1,
    })
  })

  it('should handle noip parameter with value "0"', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?noip=0',
      { title: 'Test' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      noip: 0,
    })
  })

  it('should handle noip parameter with value "false"', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?noip=false',
      { title: 'Test' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      noip: 0,
    })
  })

  it('should handle channel parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?channel=wechat',
      { title: 'Test' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      channel: 'wechat',
    })
  })

  it('should handle openid parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?openid=oABCD1234567890',
      { title: 'Test' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      openid: 'oABCD1234567890',
    })
  })

  it('should handle all optional parameters together', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SCT123456abcdefghijklmnopqrstuvwxy@turbo?short=Brief&noip=1&channel=wechat&openid=oABCD1234567890',
      { title: 'Test', body: 'Message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Test',
      desp: 'Message body',
      short: 'Brief',
      noip: 1,
      channel: 'wechat',
      openid: 'oABCD1234567890',
    })
  })

  it('should throw an error if sendKey is missing', async () => {
    await expect(serverChan.send(
      'server-chan://:@turbo',
      { title: 'Hello, world!' },
    )).rejects.toThrow('SendKey is required for Server Chan Turbo')
  })
})

describe('server-chan validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw an error for invalid hostname', async () => {
    await expect(serverChan.send(
      'server-chan://testuid:sendkey@invalid',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Invalid server-chan URL: hostname must be \'v3\' or \'turbo\', got \'invalid\'')
  })
})
