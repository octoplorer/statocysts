import type { FetchOptions } from 'ofetch'
import type { Transport } from '../transport'
import { ofetch } from 'ofetch'

/**
 * HTTP payload for HTTP transport
 */
export interface HttpPayload {
  request: Request
  fetchOptions?: FetchOptions
}

/**
 * HTTP transport implementation
 * Handles sending data over HTTP/HTTPS protocols
 */
export const httpTransport: Transport<HttpPayload> = {
  async send(payload) {
    await ofetch(payload.request, payload.fetchOptions)
  },
}
