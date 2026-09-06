import { afterEach, describe, expect, it, vi } from 'vitest'
import * as providers from './node'

const validTargets = {
  bark: 'bark://example.com/device-key',
  discord: 'discord://webhook-id:webhook-token@webhook',
  email: 'email://smtp.example.com?from=sender%40example.com&to=recipient%40example.com',
  json: 'json://example.com/webhook',
  jsons: 'jsons://example.com/webhook',
  lark: 'lark://webhook-token@webhook',
  logger: 'logger://?level=info',
  qqbot: 'qqbot://app-id:client-secret@user/open-id',
  serverChan: 'server-chan://ftqq:send-key@turbo',
  slack: 'slack://webhook/a/b/c',
  telegram: 'telegram://bot-id:bot-token@bot/chat-id',
} satisfies Record<keyof typeof providers, string>

const invalidTargets = [
  ['bark', 'bark://example.com'],
  ['discord', 'discord://webhook'],
  ['email', 'email://smtp.example.com'],
  ['lark', 'lark://webhook'],
  ['logger', 'logger://?level=verbose'],
  ['qqbot', 'qqbot://app-id:client-secret@bot/open-id'],
  ['serverChan', 'server-chan://invalid'],
  ['slack', 'slack://webhook/a/b'],
  ['telegram', 'telegram://bot'],
] as const

describe('built-in provider validation lifecycle', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('validates every provider target without remote or transport side effects', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fetch should not be called'))
    const consoleSpies = [
      vi.spyOn(console, 'debug').mockImplementation(() => {}),
      vi.spyOn(console, 'error').mockImplementation(() => {}),
      vi.spyOn(console, 'info').mockImplementation(() => {}),
      vi.spyOn(console, 'warn').mockImplementation(() => {}),
    ]

    for (const [name, target] of Object.entries(validTargets)) {
      const provider = providers[name as keyof typeof providers]
      expect(provider.validate(target).send).toBeTypeOf('function')
    }

    expect(fetchSpy).not.toHaveBeenCalled()
    consoleSpies.forEach(spy => expect(spy).not.toHaveBeenCalled())
  })

  it.each(invalidTargets)('rejects a provider-specific invalid %s target synchronously', (name, target) => {
    expect(() => providers[name].validate(target)).toThrow()
  })
})
