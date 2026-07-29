import type { Notification, Notifier } from './notification'
import { assertNotification, NotificationDeliveryError } from './notification'

interface RuntimeProvider {
  readonly protocol: string
  send: (target: string, notification: Notification) => Promise<void>
}

interface BoundTarget {
  target: string
  provider: RuntimeProvider
}

export interface NotificationRuntime {
  createNotifier: (targets: readonly string[]) => Notifier
  send: (target: string, notification: Notification) => Promise<void>
}

function assertRuntimeProvider(value: unknown): asserts value is RuntimeProvider {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('Notification provider must be an object')
  }

  const provider = value as Partial<RuntimeProvider>
  if (typeof provider.protocol !== 'string' || provider.protocol.length === 0) {
    throw new TypeError('Notification provider protocol must be a non-empty string')
  }
  if (typeof provider.send !== 'function') {
    throw new TypeError('Notification provider must define send')
  }
}

function normalizeTarget(target: unknown): { target: string, protocol: string } {
  if (typeof target !== 'string') {
    throw new TypeError('Notification target must be a string')
  }

  try {
    const url = new URL(target)
    return { target: url.toString(), protocol: url.protocol }
  }
  catch {
    throw new TypeError(`Invalid notification target: ${target}`)
  }
}

export function createNotificationRuntime(
  providers: readonly RuntimeProvider[],
): NotificationRuntime {
  const providersByProtocol = new Map<string, RuntimeProvider>()

  for (const provider of providers) {
    assertRuntimeProvider(provider)
    if (providersByProtocol.has(provider.protocol)) {
      throw new TypeError(`Duplicate notification provider protocol: ${provider.protocol}`)
    }
    providersByProtocol.set(provider.protocol, provider)
  }

  function createNotifier(targets: readonly string[]): Notifier {
    if (!Array.isArray(targets) || targets.length === 0) {
      throw new TypeError('At least one notification target is required')
    }

    const seenTargets = new Set<string>()
    const boundTargets: BoundTarget[] = targets.map((input) => {
      const normalized = normalizeTarget(input)

      if (seenTargets.has(normalized.target)) {
        throw new TypeError(`Duplicate notification target: ${normalized.target}`)
      }
      seenTargets.add(normalized.target)

      const provider = providersByProtocol.get(normalized.protocol)
      if (!provider) {
        throw new TypeError(`Unsupported notification protocol: ${normalized.protocol}`)
      }

      return { target: normalized.target, provider }
    })

    return {
      async send(notification: Notification): Promise<void> {
        assertNotification(notification)

        const results = await Promise.allSettled(
          boundTargets.map(({ provider, target }) => Promise.resolve().then(
            () => provider.send(target, notification),
          )),
        )

        const failures = results.flatMap((result, index) => result.status === 'rejected'
          ? [{ target: boundTargets[index].target, cause: result.reason }]
          : [])

        if (failures.length > 0) {
          throw new NotificationDeliveryError(failures, results.length - failures.length)
        }
      },
    }
  }

  async function send(target: string, notification: Notification): Promise<void> {
    await createNotifier([target]).send(notification)
  }

  return { createNotifier, send }
}
