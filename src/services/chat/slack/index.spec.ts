import { describe, expect, it } from 'vitest'
import { slack } from '.'

describe('slack bot API', async () => {
  it('should build a request with bot API token', async () => {
    const req = slack.buildRequest(
      'slack://CHANNELID:xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@bot',
      'Hello, world!',
    )
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://slack.com/api/chat.postMessage')
    expect(req.headers.get('Authorization')).toBe('Bearer xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      channel: 'CHANNELID',
      text: 'Hello, world!',
    })
  })

  it('should throw an error if the bot API URL is invalid', async () => {
    await expect(slack.buildRequest(
      'slack://:xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@bot',
      'Hello, world!',
    )).rejects.toThrow('Channel ID is required')

    await expect(slack.buildRequest(
      'slack://CHANNELID:@bot',
      'Hello, world!',
    )).rejects.toThrow('Bot token is required')
  })

  it('should pass all original search params to the request', async () => {
    const req = slack.buildRequest(
      'slack://CHANNELID:xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@bot?foo=bar&baz=qux',
      'Hello, world!',
    )
    expect(req.url).toBe('https://slack.com/api/chat.postMessage?foo=bar&baz=qux')
  })
})

describe('slack webhook', () => {
  it('should build a request with webhook service', async () => {
    const req = slack.buildRequest(
      'slack://webhook/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
      'Hello, world!',
    )
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      text: 'Hello, world!',
    })
  })

  it('should throw an error if the webhook URL is invalid', async () => {
    await expect(slack.buildRequest(
      'slack://webhook/T00000000/B00000000',
      'Hello, world!',
    )).rejects.toThrow('Webhook URL is invalid')
  })


  it('should pass all original search params to the request', async () => {
    const req = slack.buildRequest(
      'slack://webhook/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX?foo=bar&baz=qux',
      'Hello, world!',
    )
    expect(req.url).toBe('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX?foo=bar&baz=qux')
  })
})
