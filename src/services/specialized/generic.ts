import { assert } from '#/utils/assert'
import { z } from 'zod'

const genericOptionsSchema = z.object({
  template: z.enum(['json', 'plaintext']).optional().default('json'),
  method: z.string().optional().default('POST'),
})

export type GenericOptions = z.infer<typeof genericOptionsSchema>

function isOptionParam(key: string): boolean {
  return !key.startsWith('@') && !key.startsWith('$')
}

export function buildGenericRequest(url: URL, message: string): Request {
  assert(url.protocol === 'generic:', `Unexpected protocol ${url.protocol}`)

  const params = new URLSearchParams(url.hash.slice(1))
  const allParamsEntries = Array.from(params.entries())

  const optionsParams = Object.fromEntries(allParamsEntries.filter(([key]) => isOptionParam(key)))

  // extract options (template, contentType, method)
  const options: GenericOptions = genericOptionsSchema.parse(optionsParams)

  // extract headers (starting with @) first
  const headers = Object.fromEntries(
    allParamsEntries.filter(([key]) => key.startsWith('@'))
      .map(([key, value]) => [key.slice(1), value]),
  )

  // extract data properties (starting with $)
  const dataProperties = Object.fromEntries(
    allParamsEntries.filter(([key]) => key.startsWith('$'))
      .map(([key, value]) => [key.slice(1), value]),
  )

  const targetUrl = new URL(url.host + url.pathname)

  return new Request(targetUrl.toString(), {
    method: options.method,
    headers: {
      'Content-Type': options.template === 'json' ? 'application/json' : 'text/plain',
      ...headers,
    },
    body: options.template === 'json'
      ? JSON.stringify({ ...dataProperties, message })
      : message,
  })
}
