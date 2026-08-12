---
title: Getting started
description: Install Statocysts and send your first notification.
---

## Install the library

```sh
pnpm add statocysts
```

You can also install it with npm, Yarn, or Bun.

## Send your first notification

Import `send` and pass it a notification target plus a title and optional body:

```ts
import { send } from 'statocysts'

await send('slack://webhook/xxx/yyy/zzz', {
  title: 'Deployment complete',
  body: 'Version 0.14.0 is now live.',
})
```

Every target is represented by a protocol URL. The protocol selects the notification provider, while the rest of the URL identifies the recipient.

## Reuse multiple targets

Create a notifier when you need to send repeatedly to the same targets:

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  'slack://webhook/xxx/yyy/zzz',
  'jsons://example.com/notifications',
])

await notifier.send({ title: 'Service recovered' })
```

All targets are attempted in parallel. If any delivery fails, Statocysts rejects with a `NotificationDeliveryError` after every target has completed.

## Install the CLI

```sh
pnpm add --global @statocysts/cli
```

Send a notification directly from your terminal:

```sh
stato -u "slack://webhook/xxx/yyy/zzz" -t "Deployment complete"
```

Verify a notification URL without sending anything:

```sh
stato verify -u "slack://webhook/xxx/yyy/zzz"
```

## Next steps

- [Understand notification targets and notifiers](/statocysts/guide/core-concepts/)
- [Choose and configure a provider](/statocysts/providers/)
- [Handle partial delivery failures](/statocysts/guide/error-handling/)
- [Read the complete CLI reference](/statocysts/reference/cli/)
