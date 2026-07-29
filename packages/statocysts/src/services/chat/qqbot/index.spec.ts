import { ofetch } from 'ofetch'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '#/core/transports/http'
import { qqbot } from '.'

// Mock http transport
vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

// Mock ofetch for token requests
vi.mock('ofetch', () => ({
  ofetch: vi.fn(),
}))

const mockAccessToken = 'test-access-token-xxxx'

function mockTokenResponse(token?: string) {
  vi.mocked(ofetch).mockResolvedValue({
    access_token: token ?? mockAccessToken,
    expires_in: 7200,
  })
}

describe('qqbot user (单聊)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send plain text message with title only', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://U1:S1@user/USER_OPENID',
      { title: '你好世界' },
    )

    // Token fetch
    expect(ofetch).toHaveBeenCalledTimes(1)
    expect(ofetch).toHaveBeenCalledWith(
      'https://api.bot.qq.com/app/getAppAccessToken',
      expect.objectContaining({
        method: 'POST',
      }),
    )

    // Message send
    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.bot.qq.com/v2/users/USER_OPENID/messages')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(req.headers.get('Authorization')).toBe(`QQBot ${mockAccessToken}`)
    expect(await req.json()).toEqual({
      msg_type: 0,
      content: '你好世界',
    })
  })

  it('should send markdown message with title and body', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://U2:S2@user/USER_OPENID',
      { title: '告警', body: 'CPU 超过 90%' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.bot.qq.com/v2/users/USER_OPENID/messages')
    expect(req.headers.get('Authorization')).toBe(`QQBot ${mockAccessToken}`)
    expect(await req.json()).toEqual({
      msg_type: 2,
      markdown: {
        content: '# 告警\n\nCPU 超过 90%',
      },
    })
  })

  it('should include msg_id and msg_seq in body when provided in query', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://U3:S3@user/USER_OPENID?msg_id=ROBOT1.0_xxx&msg_seq=2',
      { title: '回复消息' },
    )

    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      msg_type: 0,
      content: '回复消息',
      msg_id: 'ROBOT1.0_xxx',
      msg_seq: 2,
    })
  })

  it('should include event_id in body when provided in query', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://U4:S4@user/USER_OPENID?event_id=EVENT_xxx',
      { title: '事件回复' },
    )

    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      msg_type: 0,
      content: '事件回复',
      event_id: 'EVENT_xxx',
    })
  })
})

describe('qqbot group (群聊)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should send plain text group message', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://G1:X1@group/GROUP_OPENID',
      { title: '群通知' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://api.bot.qq.com/v2/groups/GROUP_OPENID/messages')
    expect(await req.json()).toEqual({
      msg_type: 0,
      content: '群通知',
    })
  })

  it('should send markdown group message with title and body', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://G2:X2@group/GROUP_OPENID',
      { title: '群通知', body: '重要内容' },
    )

    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://api.bot.qq.com/v2/groups/GROUP_OPENID/messages')
    expect(await req.json()).toEqual({
      msg_type: 2,
      markdown: {
        content: '# 群通知\n\n重要内容',
      },
    })
  })
})

describe('qqbot validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error for invalid hostname', async () => {
    await expect(qqbot.send(
      'qqbot://APPID:CLIENTSECRET@invalid/OPENID',
      { title: 'test' },
    )).rejects.toThrow('Invalid qqbot URL')

    await expect(qqbot.send(
      'qqbot://APPID:CLIENTSECRET@bot/OPENID',
      { title: 'test' },
    )).rejects.toThrow('Invalid qqbot URL')
  })

  it('should throw error if App ID is missing', async () => {
    await expect(qqbot.send(
      'qqbot://:CLIENTSECRET@user/OPENID',
      { title: 'test' },
    )).rejects.toThrow('App ID is required')
  })

  it('should throw error if Client secret is missing', async () => {
    await expect(qqbot.send(
      'qqbot://APPID:@user/OPENID',
      { title: 'test' },
    )).rejects.toThrow('Client secret is required')
  })

  it('should throw error if OpenID is missing', async () => {
    await expect(qqbot.send(
      'qqbot://APPID:CLIENTSECRET@user/',
      { title: 'test' },
    )).rejects.toThrow('OpenID is required')
  })
})

describe('qqbot token caching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reuse cached token on subsequent calls', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    // First call - fetch token (use unique credentials not used elsewhere)
    await qqbot.send(
      'qqbot://CACHE1:SECRET1@user/OPENID1',
      { title: 'first' },
    )
    expect(ofetch).toHaveBeenCalledTimes(1)

    // Second call with same credentials - should use cache
    await qqbot.send(
      'qqbot://CACHE1:SECRET1@user/OPENID2',
      { title: 'second' },
    )
    // ofetch should still be called only once (token cached)
    expect(ofetch).toHaveBeenCalledTimes(1)
    expect(http.send).toHaveBeenCalledTimes(2)
  })

  it('should fetch new token for different credentials', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://DIFF1:SEC1@user/OPENID',
      { title: 'first' },
    )
    expect(ofetch).toHaveBeenCalledTimes(1)

    await qqbot.send(
      'qqbot://DIFF2:SEC2@user/OPENID',
      { title: 'second' },
    )
    expect(ofetch).toHaveBeenCalledTimes(2)
  })
})

describe('qqbot options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should use custom apiBaseUrl when provided', async () => {
    vi.mocked(ofetch).mockResolvedValue({
      access_token: 'custom-token',
      expires_in: 7200,
    })
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://BASE1:SEC1@user/OPENID',
      { title: 'test' },
      { apiBaseUrl: 'https://sandbox.bot.qq.com' },
    )

    // Token endpoint should use custom base URL
    expect(ofetch).toHaveBeenCalledWith(
      'https://sandbox.bot.qq.com/app/getAppAccessToken',
      expect.any(Object),
    )

    // Message endpoint should use custom base URL
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://sandbox.bot.qq.com/v2/users/OPENID/messages')
  })

  it('should pass fetchOptions to http transport', async () => {
    mockTokenResponse()
    vi.mocked(http.send).mockResolvedValue(undefined)

    await qqbot.send(
      'qqbot://OPT1:SEC1@user/OPENID',
      { title: 'test' },
      { fetchOptions: { timeout: 5000 } },
    )

    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    expect(callArgs.fetchOptions).toEqual({ timeout: 5000 })
  })
})
