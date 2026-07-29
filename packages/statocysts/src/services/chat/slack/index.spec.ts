import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '#/core/transports/http'
import { slack } from '.'

// Mock httpTransport
vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

describe('slack bot API', async () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a request with bot API token', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await slack.send(
      'slack://CHANNELID:xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@bot',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://slack.com/api/chat.postMessage')
    expect(req.headers.get('Authorization')).toBe('Bearer xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      channel: 'CHANNELID',
      text: 'Hello, world!',
    })
  })

  it('should build a request with markdown body using blocks', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await slack.send(
      'slack://CHANNELID:xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@bot',
      { title: 'Test Title', body: '*Bold* and _italic_' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://slack.com/api/chat.postMessage')
    expect(req.headers.get('Authorization')).toBe('Bearer xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      channel: 'CHANNELID',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Test Title',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Bold* and _italic_',
          },
        },
      ],
      text: 'Test Title',
    })
  })

  it('should throw an error if the bot API URL is invalid', async () => {
    await expect(slack.send(
      'slack://:xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@bot',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Channel ID is required')

    await expect(slack.send(
      'slack://CHANNELID:@bot',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Bot token is required')
  })

  it('should pass all original search params to the request', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await slack.send(
      'slack://CHANNELID:xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@bot?foo=bar&baz=qux',
      { title: 'Hello, world!' },
    )

    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://slack.com/api/chat.postMessage?foo=bar&baz=qux')
  })
})

describe('slack webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a request with webhook service', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await slack.send(
      'slack://webhook/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      text: 'Hello, world!',
    })
  })

  it('should build a request with markdown body using blocks via webhook', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await slack.send(
      'slack://webhook/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      { title: 'Test Title', body: '*Bold* and _italic_' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Test Title',
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Bold* and _italic_',
          },
        },
      ],
      text: 'Test Title',
    })
  })

  it('should throw an error if the webhook URL is invalid', async () => {
    await expect(slack.send(
      'slack://webhook/T00000000/B00000000',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Webhook URL is invalid')
  })

  it('should pass all original search params to the request', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await slack.send(
      'slack://webhook/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX?foo=bar&baz=qux',
      { title: 'Hello, world!' },
    )

    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX?foo=bar&baz=qux')
  })
})
