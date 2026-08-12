---
title: API reference
description: Public runtime types, functions, errors, and provider objects.
---

## `Notification`

```ts
interface Notification {
  title: string
  body?: string
}
```

`title` must be a non-empty string. `body` is optional.

## `send(target, notification)`

```ts
function send(
  target: string,
  notification: Notification,
): Promise<void>
```

Sends one notification through the provider selected by the target protocol. Provider validation and transport failures are reported through `NotificationDeliveryError`.

## `createNotifier(targets)`

```ts
function createNotifier(targets: readonly string[]): Notifier

interface Notifier {
  send: (notification: Notification) => Promise<void>
}
```

Creates a reusable notifier bound to one or more unique targets. All targets are attempted concurrently on every call.

## `NotificationDeliveryError`

```ts
interface NotificationFailure {
  target: string
  cause: unknown
}

class NotificationDeliveryError extends Error {
  readonly failures: readonly NotificationFailure[]
  readonly successCount: number
  readonly failureCount: number
}
```

The error is thrown after every target has settled when at least one target failed.

## Provider objects

The package exports one object per provider:

```ts
import {
  bark,
  discord,
  email,
  json,
  jsons,
  lark,
  logger,
  qqbot,
  serverChan,
  slack,
  telegram,
} from 'statocysts'
```

Every provider exposes its protocol and a `send()` method:

```ts
interface NotificationProvider<Protocol extends string, Options> {
  readonly protocol: Protocol
  send: (
    target: string,
    notification: Notification,
    options?: Options,
  ) => Promise<void>
}
```

Provider-specific options are described in the [provider reference](/statocysts/providers/).

## Browser entry

`statocysts/browser` exports the same runtime APIs and all providers except email.
