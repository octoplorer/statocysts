import type { FetchOptions } from 'ofetch'
import { genericProvider, slackProvider } from './shared'
import { assert } from './utils/assert'

export type Protocol = 'generic:' | 'slack:'

export const SUPPORTED_PROTOCOLS = ['generic:', 'slack:'] as const

const providers = {
  'generic:': genericProvider,
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

  await provider.send(_url.toString() as `${Protocol}//${string}`, message, options)
}

export { send }
export * from './shared'
