import type { FetchOptions } from 'ofetch'
import { defineProvider, http } from '#/shared'
import { assert } from '#/utils/assert'

export interface ServerChanOptions {
  fetchOptions?: FetchOptions
}

export const serverChan = defineProvider('server-chan:', {
  transport: http,
  defaultOptions: {} as ServerChanOptions,
  async prepare(_, options) {
    const { url } = this

    // Validate URL hostname to determine version
    assert(
      url.hostname === 'v3' || url.hostname === 'turbo',
      `Invalid server-chan URL: hostname must be 'v3' or 'turbo', got '${url.hostname}'`,
    )

    const version = url.hostname as 'v3' | 'turbo'

    let requestUrl: URL
    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])
    const body: Record<string, any> = {
      title: this.message.title,
    }

    if (this.message.body) {
      body.desp = this.message.body
    }

    if (version === 'v3') {
      // Server Chan 3: server-chan://uid:sendKey@v3?tags=<tag1>&tags=<tag2>&short=<short>
      const { username: uid, password: sendKey, searchParams } = url

      assert(uid, 'UID is required for Server Chan 3')
      assert(sendKey, 'SendKey is required for Server Chan 3')

      requestUrl = new URL(`https://${uid}.push.ft07.com/send/${sendKey}.send`)

      // Add optional parameters from searchParams
      const tags: string[] = []
      searchParams.forEach((value, key) => {
        if (key === 'tags') {
          tags.push(value)
        }
        else if (key === 'short') {
          body.short = value
        }
      })

      if (tags.length > 0) {
        body.tags = tags.join('|')
      }
    }
    else {
      // Server Chan Turbo: server-chan://:SENDKEY@turbo?short=<short>&noip=<1|0|true|false>&channel=<channel>&openid=<openid>
      const { password: sendKey, searchParams } = url

      assert(sendKey, 'SendKey is required for Server Chan Turbo')

      requestUrl = new URL(`https://sctapi.ftqq.com/${sendKey}.send`)

      // Add optional parameters from searchParams
      searchParams.forEach((value, key) => {
        if (key === 'short') {
          body.short = value
        }
        else if (key === 'noip') {
          body.noip = value === '1' || value === 'true' ? 1 : 0
        }
        else if (key === 'channel') {
          body.channel = value
        }
        else if (key === 'openid') {
          body.openid = value
        }
      })
    }

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
