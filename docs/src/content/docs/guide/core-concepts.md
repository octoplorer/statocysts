---
title: Core concepts
description: Understand notifications, targets, providers, notifiers, and the runtime.
---

Statocysts uses a small set of concepts to keep notification delivery independent from any specific service.

## Notification

A notification contains a required title and an optional body:

```ts
interface Notification {
  title: string
  body?: string
}
```

The title must be a non-empty string. A notification provider decides how to map the title and body to its service-specific payload.

## Notification target

A notification target is a protocol URL that selects a provider and identifies a recipient:

```text
slack://webhook/T00000000/B00000000/WEBHOOK_TOKEN
```

The protocol, such as `slack:`, selects the provider. The remaining URL components contain provider-specific routing and credentials. See the [provider reference](/statocysts/providers/) for tested URL formats.

:::caution
Notification target URLs often contain credentials. Store them in secrets or environment variables, redact them from logs, and never commit real targets to source control.
:::

## Notification provider

A notification provider understands one protocol and delivers notifications to matching targets. Every built-in provider is exported as a named object:

```ts
import { slack } from 'statocysts'

await slack.send(target, notification, {
  fetchOptions: { timeout: 5000 },
})
```

Call a provider directly when you need provider-specific options. Use the top-level runtime APIs for uniform routing and batch failure reporting.

## Notifier

A notifier is bound to one or more unique targets and can be reused:

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.JSON_TARGET!,
])

await notifier.send({ title: 'Deployment complete' })
```

Each send attempts all targets concurrently. A failed target does not prevent the others from being attempted.

## Notification runtime

The notification runtime registers the built-in providers, validates target protocols, and exposes `send()` and `createNotifier()`. Importing from `statocysts` creates the Node.js runtime; importing from `statocysts/browser` creates the browser-compatible runtime.
