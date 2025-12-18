import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { defineTransport } from '../transport'

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
export const http = defineTransport({
  async send(payload: HttpPayload) {
    await ofetch(payload.request, payload.fetchOptions)
  },
})
