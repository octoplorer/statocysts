import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert } from '#/utils'

interface LarkOptions {
  baseUrl?: string
  fetchOptions?: FetchOptions
}

const FEISHU_BASE_URL = 'https://open.feishu.cn'
const LARK_BASE_URL = 'https://open.larksuite.com'

async function computeSign(timestamp: string, secret: string): Promise<string> {
  const key = `${timestamp}\n${secret}`
  const encoder = new TextEncoder()
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await globalThis.crypto.subtle.sign('HMAC', cryptoKey, new Uint8Array(0))
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
}

export const lark = defineProvider('lark:', {
  transport: http,
  defaultOptions: {} as LarkOptions,
  async prepare(ctx, options) {
    const { url } = ctx

    assert(url.hostname === 'webhook', 'Invalid lark URL')
    assert(url.username, 'Webhook token is required')

    const token = url.username
    const secret = url.password || undefined
    const domain = url.searchParams.get('domain')

    const baseUrl = options.baseUrl
      ?? (domain === 'feishu' ? FEISHU_BASE_URL : LARK_BASE_URL)

    const requestUrl = new URL(`/open-apis/bot/v2/hook/${token}`, baseUrl)

    let body: Record<string, unknown>

    if (ctx.message.body) {
      body = {
        msg_type: 'interactive',
        card: {
          header: {
            title: { tag: 'plain_text', content: ctx.message.title },
          },
          elements: [
            { tag: 'markdown', content: ctx.message.body },
          ],
        },
      }
    }
    else {
      body = {
        msg_type: 'text',
        content: { text: ctx.message.title },
      }
    }

    if (secret) {
      const timestamp = Math.floor(Date.now() / 1000).toString()
      const sign = await computeSign(timestamp, secret)
      body.timestamp = timestamp
      body.sign = sign
    }

    const headers = new Headers([
      ['Content-Type', 'application/json'],
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
