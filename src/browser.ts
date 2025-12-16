import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { buildGenericRequest, buildSlackRequest } from './shared'
import { assert } from './utils/assert'

export type Protocol = 'generic:' | 'slack:'

export const SUPPORTED_PROTOCOLS = ['generic:', 'slack:']

async function send(
  url: string | URL,
  message: string,
  options?: FetchOptions,
): Promise<void> {
  const _url = typeof url === 'string' ? new URL(url) : url
  assert(
    SUPPORTED_PROTOCOLS.includes(_url.protocol),
    `Unsupported protocol ${_url.protocol}`,
  )
  let req: Request
  switch (_url.protocol) {
    case 'generic:': {
      req = buildGenericRequest(_url, message)
      break
    }
    case 'slack:': {
      req = buildSlackRequest(_url, message)
      break
    }
    default:
      throw new Error(`Unsupported protocol ${_url.protocol}`)
  }

  await ofetch(req, options)
}

export { send }
export * from './shared'
