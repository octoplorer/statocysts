import { z } from "zod"
import { assert } from "../utils/assert"

const dataPropertiesSchema = z.record(
  z.string().startsWith('$').transform(s => s.slice(1)),
  z.string()
)

const genericOptionsSchema = z.object({
  template: z.enum(['json', 'plaintext']).optional().default('json'),
  contentType: z.string().optional(),
  method: z.string().optional().default('POST')
}).transform((data) => ({
  ...data,
  contentType: data.contentType ?? (data.template === 'json' ? 'application/json' : 'text/plain')
}))

export type GenericOptions = z.infer<typeof genericOptionsSchema>

export function buildGenericRequest(url: URL, message: string): Request {
  assert(url.protocol === 'generic:', `Unexpected protocol ${url.protocol}`)

  const params = new URLSearchParams(url.hash.slice(1))
  const optionsParams = Object.fromEntries(params.entries())

  const options: GenericOptions = genericOptionsSchema.parse(optionsParams)

  // remove options from search params
  Object.keys(optionsParams).forEach(key => {
    params.delete(key)
  })

  const dataProperties = dataPropertiesSchema.parse(Object.fromEntries(params.entries()))

  const targetUrl = new URL(url.host + url.pathname)

  return new Request(targetUrl.toString(), {
    method: options.method,
    headers: {
      'Content-Type': options.contentType,
    },
    body: options.template === 'json'
      ? JSON.stringify({ ...dataProperties, message })
      : message,
  })
}
