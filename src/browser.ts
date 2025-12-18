import type { Sender, SenderUrl } from '#/shared'
import type { FetchOptions } from 'ofetch'
import { slack } from '#/services/chat/slack'
import { json } from '#/services/specialized/json'
import { buildSenderRegistry } from '#/shared'

import { assert } from '#/utils/assert'
import { ofetch } from 'ofetch'

export const senderRegistry = buildSenderRegistry([json, slack])

export function createSender(urls: SenderUrl[]): Sender {
  return senderRegistry(urls)
}

export async function send(
  url: string | URL,
  message: string,
  options?: FetchOptions,
): Promise<void> {
  const _url = typeof url === 'string' ? new URL(url) : url
  const provider = senderRegistry.resolveProvider(_url)
  assert(provider, `Unsupported protocol ${_url.protocol}`)
  const request = provider.buildRequest(_url.toString(), message, options)
  await ofetch(request, options)
}

export * from './shared'
