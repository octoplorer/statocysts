import type { ServiceProvider } from '#/core/provider'
import type { FetchOptions } from 'ofetch'
import { ofetch } from 'ofetch'

export interface Sender {
  send: (message: string, options?: FetchOptions) => Promise<void>
}

export type SenderUrl = string | URL

export interface SenderRegistry {
  (urls: SenderUrl[]): Sender
  resolveProvider: (url: string | URL) => ServiceProvider<string> | undefined
}

export function buildSenderRegistry(
  providers: ServiceProvider<string, any, any>[],
): SenderRegistry {
  const providersRegistry = new Map<string, ServiceProvider<string, any, any>>()
  providers.forEach((provider) => {
    providersRegistry.set(provider.protocol, provider)
  })

  function resolveProvider(
    url: string | URL,
  ): ServiceProvider<string> | undefined {
    const _url = typeof url === 'string' ? new URL(url) : url

    return providersRegistry.get(_url.protocol)
  }

  function createSender(urls: SenderUrl[]): Sender {
    const registries = urls.map((url) => {
      const provider = resolveProvider(url)
      if (!provider) {
        return undefined
      }
      return { provider, url }
    }).filter(p => !!p)

    return {
      async send(message: string, options?: FetchOptions) {
        for (const registry of registries) {
          const request = registry.provider.buildRequest(
            registry.url.toString(),
            message,
          )
          await ofetch(request, options)
        }
      },
    }
  }

  return Object.assign(createSender, { resolveProvider })
}
