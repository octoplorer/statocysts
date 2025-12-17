import { defineProvider } from '#/core/provider'

export const jsonProvider = defineProvider('json:', {
  createRequest() {
    const url = new URL(this.url)

    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])

    const body: Record<string, string> = {
      message: this.message,
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

    const requestUrl = url.toString().replace('json:', 'https:')

    return new Request(requestUrl, {
      method: 'POST',
      body: JSON.stringify(body),
      headers
    })
  },
})
