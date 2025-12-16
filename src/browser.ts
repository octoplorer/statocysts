import type { FetchOptions } from 'ofetch'
import type { ServiceProvider } from './core/provider'
import { genericProvider, slackProvider } from './shared'
import { assert } from './utils/assert'

export type Protocol = 'generic:' | 'slack:'

export const SUPPORTED_PROTOCOLS = ['generic:', 'slack:'] as const

const providers: Record<string, ServiceProvider<string, unknown>> = {
  'generic:': genericProvider,
  'slack:': slackProvider,
}

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

  await provider.send(_url.toString(), message, options)
}

export { send }
export * from './shared'
