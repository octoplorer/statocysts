
import { ofetch } from 'ofetch'
import { buildGenericRequest } from './services'
import { assert } from './utils/assert'

export type Protocol = 'generic:'

export const SUPPORTED_PROTOCOLS = ['generic:']

/** Overload for generic webhook service */
function send<GenericResponse>(url: `generic:${string}`, message: string): Promise<GenericResponse>

function send(url: string | URL, message: string) {
  const _url = typeof url === 'string' ? new URL(url) : url
  assert(
    SUPPORTED_PROTOCOLS.includes(_url.protocol),
    `Unsupported protocol ${_url.protocol}`,
  )
  switch (_url.protocol) {
    case 'generic:': {
      const req = buildGenericRequest(_url, message)
      return ofetch(req)
    }
    default:
      throw new Error(`Unsupported protocol ${_url.protocol}`)
  }
}

export { send }
