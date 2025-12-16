import { buildGenericRequest } from "./service"
import { assert } from "./utils/assert"

const SUPPORTED_PROTOCOLS = ['generic:']

function send(url: string | URL, message: string) {
  const _url = typeof url === 'string' ? new URL(url) : url
  assert(
    SUPPORTED_PROTOCOLS.includes(_url.protocol),
    `Unsupported protocol ${_url.protocol}`,
  )
  switch (_url.protocol) {
    case 'generic:':
      return buildGenericRequest(_url, message)
    default:
      throw new Error(`Unsupported protocol ${_url.protocol}`)
  }

}

export { send, SUPPORTED_PROTOCOLS }
