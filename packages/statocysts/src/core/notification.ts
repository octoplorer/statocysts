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
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('Notification must be an object')
  }

  const { title, body } = value as Record<string, unknown>

  if (typeof title !== 'string') {
    throw new TypeError('Notification title must be a string')
  }

  if (title.trim().length === 0) {
    throw new TypeError('Notification title must not be empty')
  }

  if (body !== undefined && typeof body !== 'string') {
    throw new TypeError('Notification body must be a string')
  }
}
