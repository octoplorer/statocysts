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
  validate(ctx) {
    const { url } = ctx

    assert(url.hostname === 'webhook', 'Invalid discord URL')
    assert(url.username, 'Webhook ID is required')
    assert(url.password, 'Webhook token is required')

    const queryResult = safeParseQuery(url, querySchema)

    if (!queryResult.success) {
      throw new Error('Invalid discord query')
    }

    return {
      webhookId: url.username,
      webhookToken: url.password,
      query: queryResult.output,
    }
  },
  async prepare(ctx, options) {
    const { message, validated } = ctx
    const { wait, ...query } = validated.query

    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])

    const content = message.body ? `## ${message.title}\n\n${message.body}` : message.title

    const body = defu({ content }, query)

    const requestUrl = new URL(`/api/webhooks/${validated.webhookId}/${validated.webhookToken}`, 'https://discord.com')

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
