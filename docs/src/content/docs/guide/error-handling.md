---
title: Error handling
description: Distinguish target setup errors from delivery failures.
---

Statocysts separates target setup errors from asynchronous delivery failures.

## Target setup errors

`createNotifier()` throws synchronously when:

- the target list is empty;
- a target is not a string or valid URL;
- normalized targets are duplicated;
- a target uses an unsupported protocol.

```ts
import { createNotifier } from 'statocysts'

try {
  const notifier = createNotifier(['unsupported://recipient'])
  await notifier.send({ title: 'Test' })
}
catch (error) {
  console.error(error)
}
```

Provider-specific URL components are generally validated when delivery starts, not when the notifier is created. The CLI `verify` command follows the same runtime-level boundary.

## Delivery failures

Top-level `send()` and notifier `.send()` reject with `NotificationDeliveryError` when one or more providers fail:

```ts
import { NotificationDeliveryError, send } from 'statocysts'

try {
  await send(process.env.NOTIFICATION_TARGET!, {
    title: 'Backup failed',
  })
}
catch (error) {
  if (!(error instanceof NotificationDeliveryError)) {
    throw error
  }

  console.error({
    successCount: error.successCount,
    failureCount: error.failureCount,
    failures: error.failures,
  })
}
```

Each failure contains the normalized target and its original `cause`. Avoid logging unredacted targets because they may contain credentials.

## Direct provider errors

A named provider call does not use the notification runtime’s batch wrapper:

```ts
import { logger } from 'statocysts'

await logger.send('logger://?level=verbose', { title: 'Test' })
```

This rejects with the logger provider’s original query-validation error. Direct calls are useful when provider-specific recovery matters; runtime calls are useful when every target should share one failure model.
