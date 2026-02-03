import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { withProtocol } from 'ufo'

async function prepareJsonRequest(this: any, ctx: any, defaultProtocol: string, options: FetchOptions) {
  const url = new URL(this.url)

  const protocol = defaultProtocol

  const headers = new Headers([
    ['Content-Type', 'application/json'],
  ])

  const body: Record<string, string> = {
    title: this.message.title,
  }

  if (this.message.body) {
    body.body = this.message.body
  }

  Array.from(url.searchParams.entries()).forEach(([key, value]) => {
    if (key.startsWith(' ')) {
      url.searchParams.delete(key)
      const headerKey = key.slice(1)
      if (headers.has(headerKey)) {
        headers.set(headerKey, value)
      }
      else {
        headers.append(headerKey, value)
      }
    }
    else if (key.startsWith(':')) {
      url.searchParams.delete(key)
      const propertyKey = key.slice(1)
      body[propertyKey] = value
    }
  })

  const requestUrl = withProtocol(url.toString(), protocol)

  const request = new Request(requestUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers,
  })

  return {
    request,
    fetchOptions: options,
  }
}

// 支持 json:// 协议（默认HTTP）
export const json = defineProvider('json:', {
  transport: http,
  defaultOptions: {} as FetchOptions,
  prepare(ctx, options) {
    return prepareJsonRequest.call(this, ctx, 'http:', options)
  },
})

// 新增 jsons:// 协议（明确HTTPS）
export const jsons = defineProvider('jsons:', {
  transport: http,
  defaultOptions: {} as FetchOptions,
  prepare(ctx, options) {
    return prepareJsonRequest.call(this, ctx, 'https:', options)
  },
})
