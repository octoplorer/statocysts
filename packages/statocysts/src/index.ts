import type { Sender, SenderUrl } from '#/shared'
import { discord } from '#/services/chat/discord'
import { lark } from '#/services/chat/lark'
import { qqbot } from '#/services/chat/qqbot'
import { slack } from '#/services/chat/slack'
import { telegram } from '#/services/chat/telegram'
import { bark } from '#/services/push/bark'
import { email } from '#/services/specialized/email'
import { json, jsons } from '#/services/specialized/json'
import { buildSenderRegistry } from '#/shared'
import { assert } from '#/utils'
import { serverChan } from './services/push/server-chan'

export const senderRegistry = buildSenderRegistry([bark, email, json, jsons, qqbot, serverChan, slack, telegram, discord, lark])

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

export { bark, discord, email, json, jsons, lark, qqbot, slack, telegram }
export * from './shared'
