import type { Notification } from './notification'
import { describe, expect, it, vi } from 'vitest'
import { NotificationDeliveryError } from './notification'
import { createNotificationRuntime } from './runtime'

function createProvider(
  protocol: string,
  send: (target: string, notification: Notification) => Promise<void> = vi.fn().mockResolvedValue(undefined),
) {
  return { protocol, send }
}

function createDeferred() {
  let resolve!: () => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, reject, resolve }
}

describe('createNotificationRuntime', () => {
  it('rejects invalid providers and duplicate protocols', () => {
    expect(() => createNotificationRuntime([{} as never])).toThrow(TypeError)
    expect(() => createNotificationRuntime([
      createProvider('test:'),
      createProvider('test:'),
    ])).toThrow('Duplicate notification provider protocol: test:')
  })

  it('creates a notifier and normalizes targets before delivery', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const runtime = createNotificationRuntime([createProvider('test:', send)])
    const notifier = runtime.createNotifier(['test://example.com/a/../path'])
    const notification = { title: '  Alert  ', body: '  Body  ' }

    await expect(notifier.send(notification)).resolves.toBeUndefined()
    expect(send).toHaveBeenCalledWith('test://example.com/path', notification)
  })

  it('rejects invalid notifier targets at creation', () => {
    const runtime = createNotificationRuntime([createProvider('test:')])

    expect(() => runtime.createNotifier([])).toThrow(TypeError)
    expect(() => runtime.createNotifier([new URL('test://example.com') as never])).toThrow(TypeError)
    expect(() => runtime.createNotifier(['not a url'])).toThrow(TypeError)
    expect(() => runtime.createNotifier(['unknown://example.com'])).toThrow('Unsupported notification protocol: unknown:')
    expect(() => runtime.createNotifier([
      'test://example.com/a/../path',
      'test://example.com/path',
    ])).toThrow('Duplicate notification target: test://example.com/path')
  })

  it('defers provider-specific target validation until delivery', async () => {
    const cause = new Error('Invalid provider-specific target')
    const runtime = createNotificationRuntime([
      createProvider('test:', vi.fn().mockRejectedValue(cause)),
    ])
    const notifier = runtime.createNotifier(['test://invalid'])

    const delivery = notifier.send({ title: 'Alert' })

    await expect(delivery).rejects.toMatchObject({
      failures: [{ target: 'test://invalid', cause }],
    })
  })

  it('starts all deliveries and waits for every target', async () => {
    const first = createDeferred()
    const second = createDeferred()
    const firstSend = vi.fn(() => first.promise)
    const secondSend = vi.fn(() => second.promise)
    const runtime = createNotificationRuntime([
      createProvider('first:', firstSend),
      createProvider('second:', secondSend),
    ])
    const notifier = runtime.createNotifier(['first://target', 'second://target'])

    const delivery = notifier.send({ title: 'Alert' })
    await vi.waitFor(() => {
      expect(firstSend).toHaveBeenCalledOnce()
      expect(secondSend).toHaveBeenCalledOnce()
    })

    first.resolve()
    let completed = false
    void delivery.then(() => {
      completed = true
    })
    await Promise.resolve()
    expect(completed).toBe(false)

    second.resolve()
    await expect(delivery).resolves.toBeUndefined()
  })

  it('waits for all targets and reports every failure without retries', async () => {
    const firstCause = new Error('first failed')
    const secondCause = new Error('second failed')
    const success = vi.fn().mockResolvedValue(undefined)
    const firstFailure = vi.fn().mockRejectedValue(firstCause)
    const secondFailure = vi.fn().mockRejectedValue(secondCause)
    const runtime = createNotificationRuntime([
      createProvider('success:', success),
      createProvider('first:', firstFailure),
      createProvider('second:', secondFailure),
    ])
    const notifier = runtime.createNotifier([
      'success://target',
      'first://target',
      'second://target',
    ])

    const delivery = notifier.send({ title: 'Alert' })

    await expect(delivery).rejects.toMatchObject({
      name: 'NotificationDeliveryError',
      failures: [
        { target: 'first://target', cause: firstCause },
        { target: 'second://target', cause: secondCause },
      ],
      successCount: 1,
      failureCount: 2,
    })
    expect(success).toHaveBeenCalledOnce()
    expect(firstFailure).toHaveBeenCalledOnce()
    expect(secondFailure).toHaveBeenCalledOnce()
  })

  it('wraps a single runtime failure', async () => {
    const cause = new Error('failed')
    const runtime = createNotificationRuntime([
      createProvider('test:', vi.fn().mockRejectedValue(cause)),
    ])

    const delivery = runtime.send('test://target', { title: 'Alert' })

    await expect(delivery).rejects.toBeInstanceOf(NotificationDeliveryError)
    await expect(delivery).rejects.toMatchObject({
      failures: [{ target: 'test://target', cause }],
      successCount: 0,
      failureCount: 1,
    })
  })

  it('validates a notification before starting any delivery', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    const runtime = createNotificationRuntime([createProvider('test:', send)])
    const notifier = runtime.createNotifier(['test://target'])

    await expect(notifier.send({ title: '   ' })).rejects.toThrow(TypeError)
    expect(send).not.toHaveBeenCalled()
  })
})
