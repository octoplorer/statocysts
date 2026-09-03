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

Validates the target and sends one notification through the selected provider. Local target/provider validation failures reject with their original error before delivery starts; request preparation and transport failures are reported through `NotificationDeliveryError`.

## `createNotifier(targets)`

```ts
function createNotifier(targets: readonly string[]): Notifier

interface Notifier {
  send: (notification: Notification) => Promise<void>
}
```

Synchronously validates one or more unique targets and creates a reusable notifier bound to their validated provider state. No transport or remote service is contacted during creation. All bound targets are attempted concurrently on every call.

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

After all targets have passed creation-time validation, this error is thrown when at least one delivery fails and every target has settled.

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

Every provider exposes its protocol, a synchronous `validate()` method, and a `send()` method:

```ts
interface NotificationProvider<Protocol extends string, Options> {
  readonly protocol: Protocol
  validate: (
    target: string,
    options?: Options,
  ) => ValidatedNotificationTarget
  send: (
    target: string,
    notification: Notification,
    options?: Options,
  ) => Promise<void>
}

interface ValidatedNotificationTarget {
  send: (notification: Notification) => Promise<void>
}
```

`validate()` checks the URL, protocol, and local provider-specific rules, then snapshots the merged options in a reusable binding. It does not contact the provider or confirm that credentials and recipients exist. Provider `send()` performs the same validation before preparing and sending its transport payload.

Provider-specific options are described in the [provider reference](/statocysts/providers/).

## Browser entry

`statocysts/browser` exports the same runtime APIs and all providers except email.
