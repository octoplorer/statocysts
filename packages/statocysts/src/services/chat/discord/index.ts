import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert, getValidateQuery } from '#/utils'
import defu from 'defu'
import z from 'zod'

interface DiscordOptions {
  fetchOptions?: FetchOptions
}

const querySchema = z.object({
  avatar_url: z.string().optional(),
  username: z.string().optional(),

  wait: z.string().transform((val) => {
    if (val === 'false' || val === '0' || val === '') {
      return false
    }
    return true
  }).optional(),
})

export const discord = defineProvider('discord:', {
  transport: http,
  defaultOptions: {} as DiscordOptions,
  async prepare(ctx, options) {
    const { url } = ctx

    assert(url.hostname === 'webhook', 'Invalid discord URL')
    assert(url.username, 'Webhook ID is required')
    assert(url.password, 'Webhook token is required')

    const queryResult = getValidateQuery(url, querySchema.safeParse)

    if (!queryResult.success) {
      throw new Error('Invalid discord query')
    }

    const { wait, ...query } = queryResult.data

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
