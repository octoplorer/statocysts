import { createNotificationRuntime } from './core/runtime'
import * as providers from './providers/browser'

const runtime = createNotificationRuntime(Object.values(providers))

export const { createNotifier, send } = runtime

export { NotificationDeliveryError } from './core/notification'
export type { Notification, NotificationFailure, Notifier } from './core/notification'
export * from './providers/browser'
