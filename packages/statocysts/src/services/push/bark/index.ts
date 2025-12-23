import type { FetchOptions } from 'ofetch'
import { defineProvider, http } from '#/shared'
import { assert, getValidateQuery, withoutPathname } from '#/utils'
import defu from 'defu'
import { withProtocol } from 'ufo'
import z from 'zod'

export interface BarkOptions {
  fetchOptions?: FetchOptions
}

const querySchema = z.object({
  subtitle: z.string().optional(),
  group: z.string().optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  sound: z.string().optional(),
  call: z.enum(['1']).optional(),
  ciphertext: z.string().optional(),
  level: z.enum(['active', 'timeSensitive', 'passive', 'critical']).optional(),
  volume: z.string().optional(),
  badge: z.coerce.number().optional(),
  autoCopy: z.enum(['1']).optional(),
  copy: z.string().optional(),
  action: z.enum(['none']).optional(),
  isArchive: z.enum(['1']).optional(),
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

    const queryResult = getValidateQuery(url, querySchema.safeParse)

    if (!queryResult.success) {
      throw new Error('Invalid Bark query parameters')
    }

    const query = queryResult.data

    const requestUrl = new URL(`/push`, withProtocol(withoutPathname(url.toString()), 'https:'))

    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])

    const contentData: { body: string, title?: string } = message.body ? { title: message.title, body: message.body } : { body: message.title }

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
