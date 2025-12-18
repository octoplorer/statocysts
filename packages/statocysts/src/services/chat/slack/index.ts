import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert } from '#/utils/assert'
import { withoutLeadingSlash } from 'ufo'

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

  fetchOptions?: FetchOptions
}

export const slack = defineProvider('slack:', {
  transport: http,
  defaultOptions: {
    hookBaseUrl: 'https://hooks.slack.com/',
    botApiBaseUrl: 'https://slack.com/',
  } as SlackOptions,
  async prepare(_, options) {
    const { url } = this

    // Validate URL format
    assert(url.hostname === 'bot' || url.hostname === 'webhook', `Invalid slack URL: ${url.toString()}`)

    const type = url.hostname as 'bot' | 'webhook'

    if (type === 'bot') {
      assert(url.username, 'Channel ID is required')
      assert(url.password, 'Bot token is required')
    }
    else {
      const pathParts = url.pathname.split('/').filter(Boolean)
      assert(pathParts.length === 3, 'Webhook URL is invalid')
    }

    let requestUrl: URL
    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])
    const body: Record<string, any> = {
      text: this.message.title,
    }

    if (type === 'bot') {
      const { username: channel, password: token, searchParams } = url
      requestUrl = new URL('/api/chat.postMessage', options.botApiBaseUrl)
      searchParams.forEach((value, key) => {
        requestUrl.searchParams.set(key, value)
      })

      headers.set('Authorization', `Bearer ${token}`)

      body.channel = channel
    }
    else {
      const { searchParams } = url
      requestUrl = new URL(`/services/${withoutLeadingSlash(url.pathname)}`, options.hookBaseUrl)
      searchParams.forEach((value, key) => {
        requestUrl.searchParams.set(key, value)
      })
    }

    const request = new Request(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(options.body ?? body),
    })

    return {
      request,
      fetchOptions: options.fetchOptions,
    }
  },
})
