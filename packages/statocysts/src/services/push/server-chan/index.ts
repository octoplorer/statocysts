import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert } from '#/utils'

export interface ServerChanOptions {
  fetchOptions?: FetchOptions
}

export const serverChan = defineProvider('server-chan:', {
  transport: http,
  defaultOptions: {} as ServerChanOptions,
  validate(ctx) {
    const { url } = ctx
    // Validate URL hostname to determine version
    assert(
      url.hostname === 'v3' || url.hostname === 'turbo',
      `Invalid server-chan URL: hostname must be 'v3' or 'turbo', got '${url.hostname}'`,
    )

    if (url.hostname === 'v3') {
      // Server Chan 3: server-chan://uid:sendKey@v3?tags=<tag1>&tags=<tag2>&short=<short>
      const { username: uid, password: sendKey, searchParams } = url

      assert(uid, 'UID is required for Server Chan 3')
      assert(sendKey, 'SendKey is required for Server Chan 3')

      // Add optional parameters from searchParams
      const tags: string[] = []
      const parameters: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        if (key === 'tags') {
          tags.push(value)
        }
        else if (key === 'short') {
          parameters.short = value
        }
      })

      if (tags.length > 0) {
        parameters.tags = tags.join('|')
      }

      return {
        parameters,
        requestUrl: `https://${uid}.push.ft07.com/send/${sendKey}.send`,
      }
    }

    // Server Chan Turbo: server-chan://ftqq:SENDKEY@turbo?short=<short>&noip=<1|0|true|false>&channel=<channel>&openid=<openid>
    // Note: username (ftqq) is optional and not used in the API request
    const { password: sendKey, searchParams } = url

    assert(sendKey, 'SendKey is required for Server Chan Turbo')

    const parameters: Record<string, number | string> = {}
    searchParams.forEach((value, key) => {
      if (key === 'short') {
        parameters.short = value
      }
      else if (key === 'noip') {
        parameters.noip = value === '1' || value === 'true' ? 1 : 0
      }
      else if (key === 'channel') {
        parameters.channel = value
      }
      else if (key === 'openid') {
        parameters.openid = value
      }
    })

    return {
      parameters,
      requestUrl: `https://sctapi.ftqq.com/${sendKey}.send`,
    }
  },
  async prepare(ctx, options) {
    const { message, validated } = ctx
    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])
    const body: Record<string, any> = {
      title: message.title,
      ...validated.parameters,
    }

    if (message.body) {
      body.desp = message.body
    }

    const request = new Request(validated.requestUrl, {
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
