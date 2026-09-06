import { describe, expect, it } from 'vitest'
import * as browserEntry from '../browser'
import * as nodeEntry from '../index'
import * as browserProviders from './browser'
import * as nodeProviders from './node'

const browserProviderNames = [
  'bark',
  'discord',
  'json',
  'jsons',
  'lark',
  'logger',
  'qqbot',
  'serverChan',
  'slack',
  'telegram',
]

const nodeProviderNames = [...browserProviderNames, 'email'].sort()

const providerTargets = {
  bark: 'bark://example.com/device-key',
  discord: 'discord://webhook-id:webhook-token@webhook',
  email: 'email://smtp.example.com?from=sender%40example.com&to=recipient%40example.com',
  json: 'json://example.com/webhook',
  jsons: 'jsons://example.com/webhook',
  lark: 'lark://webhook-token@webhook',
  logger: 'logger://',
  qqbot: 'qqbot://app-id:client-secret@user/open-id',
  serverChan: 'server-chan://ftqq:send-key@turbo',
  slack: 'slack://webhook/a/b/c',
  telegram: 'telegram://bot-id:bot-token@bot/chat-id',
} satisfies Record<keyof typeof nodeProviders, string>

function sortedKeys(value: object): string[] {
  return Object.keys(value).sort()
}

describe('provider catalogs', () => {
  it('uses the browser catalog for named exports and runtime registration', () => {
    expect(sortedKeys(browserProviders)).toEqual(browserProviderNames)

    for (const name of browserProviderNames) {
      const provider = browserProviders[name as keyof typeof browserProviders]
      expect(browserEntry[name as keyof typeof browserEntry]).toBe(provider)
      expect(provider.validate).toBeTypeOf('function')
      expect(() => browserEntry.createNotifier([providerTargets[name as keyof typeof browserProviders]])).not.toThrow()
    }
  })

  it('uses the node catalog for named exports and runtime registration', () => {
    expect(sortedKeys(nodeProviders)).toEqual(nodeProviderNames)

    for (const name of nodeProviderNames) {
      const provider = nodeProviders[name as keyof typeof nodeProviders]
      expect(nodeEntry[name as keyof typeof nodeEntry]).toBe(provider)
      expect(provider.validate).toBeTypeOf('function')
      expect(() => nodeEntry.createNotifier([providerTargets[name as keyof typeof nodeProviders]])).not.toThrow()
    }
  })

  it('does not expose legacy runtime internals', () => {
    expect(nodeEntry).not.toHaveProperty('createSender')
    expect(nodeEntry).not.toHaveProperty('senderRegistry')
    expect(nodeEntry).not.toHaveProperty('resolveProvider')
    expect(nodeEntry).not.toHaveProperty('defineProvider')
    expect(nodeEntry).not.toHaveProperty('defineTransport')
    expect(nodeEntry).not.toHaveProperty('buildSenderRegistry')
    expect(nodeEntry).not.toHaveProperty('http')
  })

  it('applies notification validation to every direct provider', async () => {
    await Promise.all(Object.entries(nodeProviders).map(async ([name, provider]) => expect(provider.send(
      providerTargets[name as keyof typeof nodeProviders],
      { title: '   ' },
    )).rejects.toThrow(TypeError)))
  })
})
