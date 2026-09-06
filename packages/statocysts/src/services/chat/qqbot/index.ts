import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert } from '#/utils'

export interface QQBotOptions {
  /**
   * Base URL for QQ Bot API
   *
   * @default `https://api.bot.qq.com`
   */
  apiBaseUrl?: string

  fetchOptions?: FetchOptions
}

interface TokenCacheEntry {
  token: string
  expiresAt: number
}

/** In-memory token cache keyed by `${appId}:${clientSecret}` */
const tokenCache = new Map<string, TokenCacheEntry>()

async function getAccessToken(
  appId: string,
  clientSecret: string,
  apiBaseUrl: string,
): Promise<string> {
  const cacheKey = `${appId}:${clientSecret}`
  const cached = tokenCache.get(cacheKey)

  // Use cached token if still valid (with 60s buffer before expiry)
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token
  }

  const response = await ofetch(`${apiBaseUrl}/app/getAppAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, clientSecret }),
  })

  const { access_token, expires_in } = response
  const token = access_token as string
  const expiresIn = (expires_in as number) || 7200

  tokenCache.set(cacheKey, {
    token,
    expiresAt: Date.now() + expiresIn * 1000,
  })

  return token
}

export const qqbot = defineProvider('qqbot:', {
  transport: http,
  defaultOptions: {
    apiBaseUrl: 'https://api.bot.qq.com',
  } as QQBotOptions,
  validate(ctx, options) {
    const { url } = ctx
    // Validate hostname (chat type)
    const chatType = url.hostname
    assert(
      chatType === 'user' || chatType === 'group',
      `Invalid qqbot URL: hostname must be "user" or "group", got "${url.hostname}"`,
    )
    assert(url.username, 'App ID is required')
    assert(url.password, 'Client secret is required')

    // Extract openid from pathname
    const pathSegments = url.pathname.split('/').filter(Boolean)
    assert(pathSegments.length === 1, 'OpenID is required in pathname')

    return {
      apiBaseUrl: options.apiBaseUrl!,
      appId: url.username,
      chatType: chatType as 'group' | 'user',
      clientSecret: url.password,
      eventId: url.searchParams.get('event_id'),
      msgId: url.searchParams.get('msg_id'),
      msgSeq: url.searchParams.get('msg_seq'),
      openid: decodeURIComponent(pathSegments[0]),
    }
  },
  async prepare(ctx, options) {
    const { message, validated } = ctx
    const accessToken = await getAccessToken(
      validated.appId,
      validated.clientSecret,
      validated.apiBaseUrl,
    )

    // Build message body
    let body: Record<string, unknown>

    if (message.body) {
      body = {
        msg_type: 2,
        markdown: {
          content: `# ${message.title}\n\n${message.body}`,
        },
      }
    }
    else {
      body = {
        msg_type: 0,
        content: message.title,
      }
    }

    // Extract reply-related params from query string
    if (validated.msgId) {
      body.msg_id = validated.msgId
    }
    if (validated.msgSeq) {
      body.msg_seq = Number.parseInt(validated.msgSeq, 10)
    }
    if (validated.eventId) {
      body.event_id = validated.eventId
    }

    // Build API URL
    const apiPath = validated.chatType === 'user'
      ? `/v2/users/${validated.openid}/messages`
      : `/v2/groups/${validated.openid}/messages`

    const requestUrl = new URL(apiPath, validated.apiBaseUrl)

    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Authorization', `QQBot ${accessToken}`],
    ])

    const request = new Request(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    return {
      request,
      fetchOptions: options.fetchOptions,
    }
  },
})
