---
title: Multi-target delivery
description: Fan out notifications, inspect partial failures, and retry only failed targets.
---

Create one notifier when the same event should reach several destinations:

```ts
import { createNotifier } from 'statocysts'

const operations = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
  process.env.EMAIL_TARGET!,
])

await operations.send({
  title: 'Service recovered',
  body: 'Event: incident-2026-08-12-0142',
})
```

Statocysts attempts every target concurrently. One failure does not stop the remaining deliveries.

## Retry only failed targets

Reusing the original notifier after a partial failure sends the notification to successful targets again. Instead, create a temporary notifier from `error.failures`:

```ts
import {
  createNotifier,
  NotificationDeliveryError,
} from 'statocysts'

const notification = {
  title: 'Service recovered',
  body: 'Event: incident-2026-08-12-0142',
}

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
  process.env.EMAIL_TARGET!,
])

try {
  await notifier.send(notification)
}
catch (error) {
  if (!(error instanceof NotificationDeliveryError)) {
    throw error
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  const retry = createNotifier(
    error.failures.map(failure => failure.target),
  )

  await retry.send(notification)
}
```

:::caution
A retry can still duplicate a notification when a provider accepted the first request but its response was lost. Statocysts does not provide a cross-provider idempotency guarantee. Include a stable event identifier in the body when operators need to recognize duplicates.
:::

## Add a retry budget

Keep the retry count small, increase the delay between attempts, and stop retrying permanent validation or authentication failures. Because provider causes are `unknown`, classify only error shapes you understand for the specific provider.

A production retry loop should record:

- a non-secret destination label;
- attempt count and elapsed time;
- the provider protocol;
- a reviewed error category;
- the final success or dead-letter outcome.

Do not log `failure.target`; it may contain credentials. See [Security](/statocysts/guide/security/).

## Separate critical and best-effort destinations

Use separate notifiers when targets have different delivery policies:

```ts
const critical = createNotifier([
  process.env.ON_CALL_TARGET!,
])

const bestEffort = createNotifier([
  process.env.ACTIVITY_LOG_TARGET!,
  process.env.TEAM_CHAT_TARGET!,
])

await critical.send(notification)
await bestEffort.send(notification).catch(() => undefined)
```

This makes the policy explicit: a critical delivery blocks the workflow, while best-effort delivery does not. Avoid silently ignoring critical failures.

## Reuse long-lived notifiers

Create notifiers once when target configuration is stable. Construction normalizes URLs, rejects duplicates, and binds each target to its provider before the first delivery. Recreate a notifier after rotating or changing target configuration.
