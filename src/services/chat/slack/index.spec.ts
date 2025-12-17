import { describe, expect, it } from 'vitest'
import { slackProvider } from '.'

describe('slack bot API', async () => {
  it('should build a request with bot API token', async () => {
    const req = await slackProvider.buildRequest(
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
})

describe('slack webhook', () => {
  it('should build a request with webhook service', async () => {
    const req = await slackProvider.buildRequest(
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

})
