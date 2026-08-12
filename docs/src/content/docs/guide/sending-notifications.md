---
title: Send notifications
description: Send once, reuse targets, and configure individual providers.
---

## Send to one target

Use `send()` for a one-off delivery:

```ts
import { send } from 'statocysts'

await send(process.env.SLACK_TARGET!, {
  title: 'Deployment complete',
  body: 'Version 0.14.0 is now live.',
})
```

`send()` validates the target protocol, attempts delivery, and rejects with a `NotificationDeliveryError` if delivery fails.

## Reuse a notifier

Create a notifier when the same target set receives multiple notifications:

```ts
import { createNotifier } from 'statocysts'

const operations = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
])

await operations.send({ title: 'Deployment started' })
await operations.send({ title: 'Deployment complete' })
```

Targets must be unique. The runtime rejects an empty target list, malformed URLs, duplicate normalized URLs, and unsupported protocols when the notifier is created.

## Handle partial failures

All targets are attempted concurrently. Inspect each failed target after the batch completes:

```ts
import { createNotifier, NotificationDeliveryError } from 'statocysts'

try {
  await operations.send({ title: 'Service recovered' })
}
catch (error) {
  if (error instanceof NotificationDeliveryError) {
    console.error(`${error.failureCount} deliveries failed`)

    for (const failure of error.failures) {
      console.error(failure.target, failure.cause)
    }
  }
  else {
    throw error
  }
}
```

Read [error handling](/statocysts/guide/error-handling/) for validation and delivery error boundaries.

## Configure a provider

Call a named provider when you need options that do not belong in the notification target:

```ts
import { telegram } from 'statocysts'

await telegram.send(
  process.env.TELEGRAM_TARGET!,
  { title: 'Deployment complete' },
  {
    apiBaseUrl: 'https://api.telegram.org',
    fetchOptions: { timeout: 5000 },
  },
)
```

A direct provider call preserves its original validation or transport error instead of wrapping it in `NotificationDeliveryError`.
