import { http } from '#/core/transports/http'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { lark } from '.'

vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

describe('lark', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('should send a text message with title only', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await lark.send(
      'lark://my-token@webhook',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://open.larksuite.com/open-apis/bot/v2/hook/my-token')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      msg_type: 'text',
      content: { text: 'Hello, world!' },
    })
  })

  it('should send an interactive card with title and body', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await lark.send(
      'lark://my-token@webhook',
      { title: 'Alert', body: '**Something happened**' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      msg_type: 'interactive',
      card: {
        header: {
          title: { tag: 'plain_text', content: 'Alert' },
        },
        elements: [
          { tag: 'markdown', content: '**Something happened**' },
        ],
      },
    })
  })

  it('should include timestamp and sign when secret is provided', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)

    await lark.send(
      'lark://my-token:my-secret@webhook',
      { title: 'Signed message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    const body = await req.json()
    expect(body.msg_type).toBe('text')
    expect(body.content).toEqual({ text: 'Signed message' })
    expect(body.timestamp).toBe('1700000000')
    expect(body.sign).toBeTypeOf('string')
    expect(body.sign.length).toBeGreaterThan(0)
  })

  it('should use feishu domain when domain=feishu', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await lark.send(
      'lark://my-token@webhook?domain=feishu',
      { title: 'Feishu message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://open.feishu.cn/open-apis/bot/v2/hook/my-token')
  })

  it('should use larksuite domain by default', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await lark.send(
      'lark://my-token@webhook',
      { title: 'Lark message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://open.larksuite.com/open-apis/bot/v2/hook/my-token')
  })

  it('should throw an error if token is missing', async () => {
    await expect(lark.send(
      'lark://:secret@webhook',
      { title: 'Hello' },
    )).rejects.toThrow('Webhook token is required')
  })

  it('should throw an error for invalid hostname', async () => {
    await expect(lark.send(
      'lark://my-token@invalid',
      { title: 'Hello' },
    )).rejects.toThrow('Invalid lark URL')
  })

  it('should pass fetchOptions when provided', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await lark.send(
      'lark://my-token@webhook',
      { title: 'Hello' },
      { fetchOptions: { timeout: 5000 } },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    expect(callArgs.fetchOptions).toEqual({ timeout: 5000 })
  })

  it('should respect custom baseUrl from options', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await lark.send(
      'lark://my-token@webhook',
      { title: 'Custom' },
      { baseUrl: 'https://custom.example.com' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://custom.example.com/open-apis/bot/v2/hook/my-token')
  })
})
