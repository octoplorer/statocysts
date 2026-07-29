import { assert } from '#/utils'

export interface Notification {
  title: string
  body?: string
}

export interface NotificationFailure {
  target: string
  cause: unknown
}

export interface Notifier {
  send: (notification: Notification) => Promise<void>
}

export class NotificationDeliveryError extends Error {
  readonly failures: readonly NotificationFailure[]
  readonly successCount: number
  readonly failureCount: number

  constructor(failures: readonly NotificationFailure[], successCount: number) {
    const failureCount = failures.length
    const totalCount = successCount + failureCount
    super(`Failed to deliver notification to ${failureCount} of ${totalCount} targets`)

    this.name = 'NotificationDeliveryError'
    this.failures = [...failures]
    this.successCount = successCount
    this.failureCount = failureCount
  }
}

export function assertNotification(value: unknown): asserts value is Notification {
  assert(
    typeof value === 'object' && value !== null,
    new TypeError('Notification must be an object'),
  )

  const { title, body } = value as Record<string, unknown>

  assert(
    typeof title === 'string',
    new TypeError('Notification title must be a string'),
  )
  assert(
    title.trim().length > 0,
    new TypeError('Notification title must not be empty'),
  )
  assert(
    body === undefined || typeof body === 'string',
    new TypeError('Notification body must be a string'),
  )
}
