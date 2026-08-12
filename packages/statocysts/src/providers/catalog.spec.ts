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

function sortedKeys(value: object): string[] {
  return Object.keys(value).sort()
}

describe('provider catalogs', () => {
  it('uses the browser catalog for named exports and runtime registration', () => {
    expect(sortedKeys(browserProviders)).toEqual(browserProviderNames)

    for (const name of browserProviderNames) {
      const provider = browserProviders[name as keyof typeof browserProviders]
      expect(browserEntry[name as keyof typeof browserEntry]).toBe(provider)
      expect(() => browserEntry.createNotifier([`${provider.protocol}//target`])).not.toThrow()
    }
  })

  it('uses the node catalog for named exports and runtime registration', () => {
    expect(sortedKeys(nodeProviders)).toEqual(nodeProviderNames)

    for (const name of nodeProviderNames) {
      const provider = nodeProviders[name as keyof typeof nodeProviders]
      expect(nodeEntry[name as keyof typeof nodeEntry]).toBe(provider)
      expect(() => nodeEntry.createNotifier([`${provider.protocol}//target`])).not.toThrow()
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
    await Promise.all(Object.values(nodeProviders).map(async provider => expect(provider.send(
      `${provider.protocol}//target`,
      { title: '   ' },
    )).rejects.toThrow(TypeError)))
  })
})
