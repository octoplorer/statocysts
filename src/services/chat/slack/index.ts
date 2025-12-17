import { defineProvider } from '#/core/provider'
import { assert } from '#/utils/assert'

export interface SlackData {
  type: 'bot' | 'webhook'
}

export interface SlackOptions {
  /**
   * The base URL for webhook services
   * 
   * @default `https://hooks.slack.com/services`
   */
  hookBaseUrl: string
  /**
   * The base URL for bot API services
   * 
   * @default `https://slack.com/api`
   */
  botApiBaseUrl: string
}

export const slackProvider = defineProvider('slack:', {
  extractor: (url) => {
    assert(url.hostname === 'bot' || url.hostname === 'webhook', `Invalid slack URL: ${url.toString()}`)
    return {
      type: url.hostname,
    } as SlackData
  },
  defaultOptions: {
    hookBaseUrl: 'https://hooks.slack.com/services',
    botApiBaseUrl: 'https://slack.com/api',
  } as SlackOptions,
  createRequest(_, options) {
    const { type } = this.data
    if (type === 'bot') {
      const { username: channel, password: token } = this.url
      const url = new URL('/chat.postMessage', options.botApiBaseUrl)
      return new Request(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          text: this.message,
        }),
      })
    }
    const hookUrl = new URL(this.url.pathname, options.hookBaseUrl)
    return new Request(hookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: this.message,
      }),
    })
  },
})
