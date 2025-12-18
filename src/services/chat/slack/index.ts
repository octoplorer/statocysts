import { defineProvider } from '#/core/provider'
import { assert } from '#/utils/assert'
import { withoutLeadingSlash } from 'ufo'

export interface SlackData {
  type: 'bot' | 'webhook'
}

export interface SlackOptions {
  /**
   * The base URL for webhook services
   *
   * @default `https://hooks.slack.com/services`
   */
  hookBaseUrl?: string
  /**
   * The base URL for bot API services
   *
   * @default `https://slack.com/api`
   */
  botApiBaseUrl?: string

  /**
   * The body of the request
   *
   * NOTICE*: This will override the body of the request. You should known what you are doing.
   */
  body?: Record<string, any>
}

export const slackProvider = defineProvider('slack:', {
  extractor: (url) => {
    assert(url.hostname === 'bot' || url.hostname === 'webhook', `Invalid slack URL: ${url.toString()}`)
    if (url.hostname === 'bot') {
      assert(url.username, 'Channel ID is required')
      assert(url.password, 'Bot token is required')
    }
    else {
      const pathParts = url.pathname.split('/').filter(Boolean)
      assert(pathParts.length === 3, 'Webhook URL is invalid')
    }
    return {
      type: url.hostname,
    } as SlackData
  },
  defaultOptions: {
    hookBaseUrl: 'https://hooks.slack.com/',
    botApiBaseUrl: 'https://slack.com/',
  } as SlackOptions,
  createRequest(_, options) {
    const { type } = this.data
    let url: URL
    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])
    const body: Record<string, any> = {
      text: this.message,
    }
    if (type === 'bot') {
      const { username: channel, password: token, searchParams } = this.url
      url = new URL('/api/chat.postMessage', options.botApiBaseUrl)
      searchParams.forEach((value, key) => {
        url.searchParams.set(key, value)
      })

      headers.set('Authorization', `Bearer ${token}`)

      body.channel = channel
    }
    else {
      const { searchParams } = this.url
      url = new URL(`/services/${withoutLeadingSlash(this.url.pathname)}`, options.hookBaseUrl)
      searchParams.forEach((value, key) => {
        url.searchParams.set(key, value)
      })
    }

    return new Request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(options.body ?? body),
    })
  },
})
