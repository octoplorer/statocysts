import type { FetchOptions } from 'ofetch'
import defu from 'defu'
import * as v from 'valibot'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert, safeParseQuery } from '#/utils'

interface DiscordOptions {
  fetchOptions?: FetchOptions
}

const querySchema = v.object({
  avatar_url: v.optional(v.string()),
  username: v.optional(v.string()),

  wait: v.optional(v.pipe(v.string(), v.transform((val) => {
    if (val === 'false' || val === '0' || val === '') {
      return false
    }
    return true
  }))),
})

export const discord = defineProvider('discord:', {
  transport: http,
  defaultOptions: {} as DiscordOptions,
  async prepare(ctx, options) {
    const { url } = ctx

    assert(url.hostname === 'webhook', 'Invalid discord URL')
    assert(url.username, 'Webhook ID is required')
    assert(url.password, 'Webhook token is required')

    const queryResult = safeParseQuery(url, querySchema)

    if (!queryResult.success) {
      throw new Error('Invalid discord query')
    }

    const { wait, ...query } = queryResult.output

    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])

    const content = ctx.message.body ? `## ${ctx.message.title}\n\n${ctx.message.body}` : ctx.message.title

    const body = defu({ content }, query)

    const requestUrl = new URL(`/api/webhooks/${url.username}/${url.password}`, 'https://discord.com')

    if (wait) {
      requestUrl.searchParams.set('wait', 'true')
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
