import type { FetchOptions } from 'ofetch'
import defu from 'defu'
import { withProtocol } from 'ufo'
import * as v from 'valibot'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { assert, safeParseQuery, withoutPathname } from '#/utils'

export interface BarkOptions {
  fetchOptions?: FetchOptions
}

const querySchema = v.object({
  subtitle: v.optional(v.string()),
  group: v.optional(v.string()),
  url: v.optional(v.string()),
  icon: v.optional(v.string()),
  sound: v.optional(v.string()),
  call: v.optional(v.picklist(['1'])),
  ciphertext: v.optional(v.string()),
  level: v.optional(v.picklist(['active', 'timeSensitive', 'passive', 'critical'])),
  volume: v.optional(v.string()),
  badge: v.optional(v.pipe(v.unknown(), v.transform(input => Number(input)), v.number())),
  autoCopy: v.optional(v.picklist(['1'])),
  copy: v.optional(v.string()),
  action: v.optional(v.picklist(['none'])),
  isArchive: v.optional(v.picklist(['1'])),
})

export const bark = defineProvider('bark:', {
  transport: http,
  defaultOptions: {} as BarkOptions,
  async prepare(ctx, options) {
    const { message, url } = ctx

    assert(url.hostname, 'Server URL hostname is required')
    assert(url.pathname, 'Device key is required')

    const deviceKeys = url.pathname.split('/').filter(Boolean)
    assert(deviceKeys.length > 0, 'At least one device key is required')

    const queryResult = safeParseQuery(url, querySchema)

    if (!queryResult.success) {
      throw new Error('Invalid Bark query parameters')
    }

    const query = queryResult.output

    const requestUrl = new URL(`/push`, withProtocol(withoutPathname(url.toString()), 'https:'))

    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])

    const contentData: { markdown: string, title?: string } = message.body ? { title: message.title, markdown: message.body } : { markdown: message.title }

    const body = defu({ device_keys: deviceKeys }, contentData, query)

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
