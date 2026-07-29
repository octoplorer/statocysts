import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '#/core/transports/http'
import { serverChan } from '.'

// Mock httpTransport
vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

describe('server-chan v3 basic functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request with title only for v3', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://myuid:mySendKey@v3',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://myuid.push.ft07.com/send/mySendKey.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Hello, world!',
    })
  })

  it('should build a request with title and body for v3', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://myuid:mySendKey@v3',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://myuid.push.ft07.com/send/mySendKey.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Test Title',
      desp: 'This is the message body',
    })
  })

  it('should handle tags parameter for v3', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://myuid:mySendKey@v3?tags=important&tags=urgent',
      { title: 'Tagged notification' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Tagged notification',
      tags: 'important|urgent',
    })
  })

  it('should handle short parameter for v3', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://myuid:mySendKey@v3?short=Brief%20summary',
      { title: 'Full Title', body: 'Full message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Full Title',
      desp: 'Full message body',
      short: 'Brief summary',
    })
  })

  it('should handle both tags and short parameters for v3', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://myuid:mySendKey@v3?tags=tag1&tags=tag2&tags=tag3&short=Summary',
      { title: 'Complex notification', body: 'With multiple params' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Complex notification',
      desp: 'With multiple params',
      tags: 'tag1|tag2|tag3',
      short: 'Summary',
    })
  })
})

describe('server-chan turbo basic functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request with title only for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo',
      { title: 'Hello Turbo!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://sctapi.ftqq.com/SENDKEY123.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Hello Turbo!',
    })
  })

  it('should work without username for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://:SENDKEY123@turbo',
      { title: 'No username' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://sctapi.ftqq.com/SENDKEY123.send')
    expect(await req.json()).toEqual({
      title: 'No username',
    })
  })

  it('should build a request with title and body for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://sctapi.ftqq.com/SENDKEY123.send')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      title: 'Test Title',
      desp: 'This is the message body',
    })
  })

  it('should handle short parameter for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?short=Brief',
      { title: 'Full Title', body: 'Full message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Full Title',
      desp: 'Full message',
      short: 'Brief',
    })
  })

  it('should handle noip parameter with value "1" for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?noip=1',
      { title: 'No IP tracking' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'No IP tracking',
      noip: 1,
    })
  })

  it('should handle noip parameter with value "true" for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?noip=true',
      { title: 'No IP tracking' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'No IP tracking',
      noip: 1,
    })
  })

  it('should handle noip parameter with value "0" for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?noip=0',
      { title: 'With IP tracking' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'With IP tracking',
      noip: 0,
    })
  })

  it('should handle noip parameter with value "false" for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?noip=false',
      { title: 'With IP tracking' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'With IP tracking',
      noip: 0,
    })
  })

  it('should handle channel parameter for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?channel=9',
      { title: 'Custom channel' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Custom channel',
      channel: '9',
    })
  })

  it('should handle openid parameter for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?openid=user123',
      { title: 'To specific user' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'To specific user',
      openid: 'user123',
    })
  })

  it('should handle multiple query parameters for turbo', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await serverChan.send(
      'server-chan://ftqq:SENDKEY123@turbo?short=Summary&noip=1&channel=9&openid=user123',
      { title: 'Complex notification', body: 'With many options' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      title: 'Complex notification',
      desp: 'With many options',
      short: 'Summary',
      noip: 1,
      channel: '9',
      openid: 'user123',
    })
  })
})

describe('server-chan validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw an error for invalid hostname', async () => {
    await expect(serverChan.send(
      'server-chan://myUid:mySendKey@invalid',
      { title: 'Invalid hostname' },
    )).rejects.toThrow('Invalid server-chan URL: hostname must be \'v3\' or \'turbo\', got \'invalid\'')
  })

  it('should throw an error if uid is missing for v3', async () => {
    await expect(serverChan.send(
      'server-chan://:mySendKey@v3',
      { title: 'No UID' },
    )).rejects.toThrow('UID is required for Server Chan 3')
  })

  it('should throw an error if sendKey is missing for v3', async () => {
    await expect(serverChan.send(
      'server-chan://myuid@v3',
      { title: 'No SendKey' },
    )).rejects.toThrow('SendKey is required for Server Chan 3')
  })

  it('should throw an error if sendKey is missing for turbo', async () => {
    await expect(serverChan.send(
      'server-chan://ftqq@turbo',
      { title: 'No SendKey' },
    )).rejects.toThrow('SendKey is required for Server Chan Turbo')
  })

  it('should throw an error if sendKey is empty for turbo', async () => {
    await expect(serverChan.send(
      'server-chan://:@turbo',
      { title: 'Empty SendKey' },
    )).rejects.toThrow('SendKey is required for Server Chan Turbo')
  })
})
