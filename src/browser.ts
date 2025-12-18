import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'
import { jsonProvider, slackProvider } from './shared'
import { assert } from './utils/assert'

export type Protocol = 'json:' | 'slack:'

export const SUPPORTED_PROTOCOLS = ['json:', 'slack:'] as const

const providers = {
  'json:': jsonProvider,
  'slack:': slackProvider,
} as const

async function send(
  url: string | URL,
  message: string,
  options?: FetchOptions,
): Promise<void> {
  const _url = typeof url === 'string' ? new URL(url) : url
  assert(
    SUPPORTED_PROTOCOLS.includes(_url.protocol as Protocol),
    `Unsupported protocol ${_url.protocol}`,
  )

  const provider = providers[_url.protocol as Protocol]
  if (!provider) {
    throw new Error(`Unsupported protocol ${_url.protocol}`)
  }

  const request = await provider.buildRequest(_url.toString(), message)
  await ofetch(request, options)
}

export * from './shared'
export { send }

