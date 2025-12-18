import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { httpTransport } from '#/core/transports/http'
import { withProtocol } from 'ufo'

export const json = defineProvider('json:', {
  async send(_, options) {
    const url = new URL(this.url)

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
        // `+` prefix which will be encoded as ` ` is for headers, remove it on searchParams and add to headers
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
        // `:` prefix is for body properties, remove it on searchParams and add to body
        url.searchParams.delete(key)
        const propertyKey = key.slice(1)
        body[propertyKey] = value
      }
    })

    const requestUrl = withProtocol(url.toString(), 'https:')

    const request = new Request(requestUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    })

    const fetchOptions: FetchOptions | undefined = options as FetchOptions

    await httpTransport.send({
      request,
      fetchOptions,
    })
  },
})
