import type { FetchOptions } from 'ofetch'
import { withoutLeadingSlash } from 'ufo'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert } from '#/utils'

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
  validate(ctx) {
    const { url } = ctx
    assert(url.hostname === 'bot' || url.hostname === 'webhook', `Invalid slack URL: ${url.toString()}`)

    const searchParams = Array.from(url.searchParams.entries())
    if (url.hostname === 'bot') {
      assert(url.username, 'Channel ID is required')
      assert(url.password, 'Bot token is required')

      return {
        type: 'bot' as const,
        channel: url.username,
        token: url.password,
        searchParams,
      }
    }

    const pathParts = url.pathname.split('/').filter(Boolean)
    assert(pathParts.length === 3, 'Webhook URL is invalid')

    return {
      type: 'webhook' as const,
      path: withoutLeadingSlash(url.pathname),
      searchParams,
    }
  },
  async prepare(ctx, options) {
    const { message, validated } = ctx

    let requestUrl: URL
    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])
    const body: Record<string, any> = {}

    // Build message content based on title and body
    if (message.body) {
      // When body is present, use blocks for rich markdown formatting
      body.blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: message.title,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message.body,
          },
        },
      ]
      // Fallback text for notifications
      body.text = message.title
    }
    else {
      // When only title is present, use simple text format
      body.text = message.title
    }

    if (validated.type === 'bot') {
      requestUrl = new URL('/api/chat.postMessage', options.botApiBaseUrl)
      validated.searchParams.forEach(([key, value]) => {
        requestUrl.searchParams.set(key, value)
      })

      headers.set('Authorization', `Bearer ${validated.token}`)

      body.channel = validated.channel
    }
    else {
      requestUrl = new URL(`/services/${validated.path}`, options.hookBaseUrl)
      validated.searchParams.forEach(([key, value]) => {
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
