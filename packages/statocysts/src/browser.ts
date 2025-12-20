import type { Sender, SenderUrl } from '#/shared'
import { slack } from '#/services/chat/slack'
import { json } from '#/services/specialized/json'
import { buildSenderRegistry } from '#/shared'

import { assert } from '#/utils/assert'

export const senderRegistry = buildSenderRegistry([json, slack])

export function createSender(urls: SenderUrl[]): Sender {
  return senderRegistry(urls)
}

export async function send(
  url: string | URL,
  title: string,
  body?: string,
): Promise<void> {
  const _url = typeof url === 'string' ? new URL(url) : url
  const provider = senderRegistry.resolveProvider(_url)
  assert(provider, `Unsupported protocol ${_url.protocol}`)
  const messageObj = { title, body }
  await provider.send(_url.toString(), messageObj)
}

export { json, slack }
export * from './shared'
