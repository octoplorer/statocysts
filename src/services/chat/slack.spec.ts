import { describe, expect, it } from 'vitest'
import { buildSlackRequest } from './slack'

describe('slack', () => {
  describe('bot API format', () => {
    it('should build a request with Bot API token', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L'),
        'Hello, world!',
      )

      expect(request.method).toBe('POST')
      expect(request.url).toBe('https://slack.com/api/chat.postMessage')
      expect(request.headers.get('Authorization')).toBe('Bearer xoxb-123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX')
      expect(request.headers.get('Content-Type')).toBe('application/json')

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
      })
    })

    it('should build a request with botname parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L?botname=TestBot'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
        username: 'TestBot',
      })
    })

    it('should build a request with icon emoji parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L?icon=%3Arobot_face%3A'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
        icon_emoji: ':robot_face:',
      })
    })

    it('should build a request with icon URL parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L?icon=https%3A%2F%2Fexample.com%2Ficon.png'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
        icon_url: 'https://example.com/icon.png',
      })
    })

    it('should build a request with color parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L?color=good'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
        attachments: [
          {
            color: 'good',
          },
        ],
      })
    })

    it('should build a request with title parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L?title=Test+Title'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
        attachments: [
          {
            title: 'Test Title',
          },
        ],
      })
    })

    it('should build a request with thread_ts parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L?thread_ts=1234567890.123456'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
        thread_ts: '1234567890.123456',
      })
    })

    it('should build a request with multiple parameters', async () => {
      const request = buildSlackRequest(
        new URL('slack://xoxb:123456789012-1234567890123-XXXXXXXXXXXXXXXXXXXXXXXX@C001CH4NN3L?botname=TestBot&icon=%3Arobot_face%3A&color=warning&title=Alert'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        channel: 'C001CH4NN3L',
        text: 'Hello, world!',
        username: 'TestBot',
        icon_emoji: ':robot_face:',
        attachments: [
          {
            color: 'warning',
            title: 'Alert',
          },
        ],
      })
    })
  })

  describe('webhook format', () => {
    it('should build a request with webhook token', async () => {
      const request = buildSlackRequest(
        new URL('slack://hook:T00000000-B00000000-XXXXXXXXXXXXXXXXXXXXXXXX@webhook'),
        'Hello, world!',
      )

      expect(request.method).toBe('POST')
      expect(request.url).toBe('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX')
      expect(request.headers.get('Content-Type')).toBe('application/json')

      const body = await request.json()
      expect(body).toEqual({
        text: 'Hello, world!',
      })
    })

    it('should build a webhook request with botname parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://hook:T00000000-B00000000-XXXXXXXXXXXXXXXXXXXXXXXX@webhook?botname=TestBot'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        text: 'Hello, world!',
        username: 'TestBot',
      })
    })

    it('should build a webhook request with icon emoji parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://hook:T00000000-B00000000-XXXXXXXXXXXXXXXXXXXXXXXX@webhook?icon=%3Arobot_face%3A'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        text: 'Hello, world!',
        icon_emoji: ':robot_face:',
      })
    })

    it('should build a webhook request with color parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://hook:T00000000-B00000000-XXXXXXXXXXXXXXXXXXXXXXXX@webhook?color=danger'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        text: 'Hello, world!',
        attachments: [
          {
            color: 'danger',
          },
        ],
      })
    })

    it('should build a webhook request with title parameter', async () => {
      const request = buildSlackRequest(
        new URL('slack://hook:T00000000-B00000000-XXXXXXXXXXXXXXXXXXXXXXXX@webhook?title=Webhook+Title'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        text: 'Hello, world!',
        attachments: [
          {
            title: 'Webhook Title',
          },
        ],
      })
    })

    it('should build a webhook request with hex color', async () => {
      const request = buildSlackRequest(
        new URL('slack://hook:T00000000-B00000000-XXXXXXXXXXXXXXXXXXXXXXXX@webhook?color=%23ff8000'),
        'Hello, world!',
      )

      const body = await request.json()
      expect(body).toEqual({
        text: 'Hello, world!',
        attachments: [
          {
            color: '#ff8000',
          },
        ],
      })
    })
  })
})
