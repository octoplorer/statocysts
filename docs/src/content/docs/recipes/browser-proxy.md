---
title: Browser proxy
description: Trigger privileged notifications from a browser while keeping targets on the server.
---

The browser should submit a small, authenticated event to your backend. The backend validates that event, chooses a server-owned target, and calls the Node.js entry.

## Server handler

The following framework-neutral handler accepts one allowlisted event. Adapt it to your router’s request and response conventions:

```ts
import { send } from 'statocysts'

const notifications = {
  'export-complete': {
    target: process.env.OPERATIONS_TARGET,
    title: 'Export complete',
  },
} as const

type EventName = keyof typeof notifications

export async function handleNotificationRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const input: unknown = await request.json()

  if (
    typeof input !== 'object'
    || input === null
    || !('event' in input)
    || typeof input.event !== 'string'
    || !(input.event in notifications)
  ) {
    return Response.json({ error: 'Invalid event' }, { status: 400 })
  }

  const event = input.event as EventName
  const notification = notifications[event]

  if (!notification.target) {
    return Response.json({ error: 'Server is not configured' }, { status: 503 })
  }

  await send(notification.target, { title: notification.title })

  return new Response(null, { status: 204 })
}
```

The client selects an event name, not a target URL, provider, recipient, title, or arbitrary request options.

## Browser request

```ts
const response = await fetch('/api/notifications', {
  method: 'POST',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'export-complete' }),
})

if (!response.ok) {
  throw new Error('Unable to request notification delivery')
}
```

## Required production controls

The minimal handler demonstrates the trust boundary, not a complete public endpoint. Add controls appropriate to your application:

- authenticate the caller and authorize the event;
- protect cookie-authenticated requests against CSRF;
- rate-limit by account and source;
- enforce a small request body limit;
- map events to server-owned text and targets;
- return generic errors without provider credentials;
- record a non-secret audit identifier;
- prevent duplicate submissions where the product flow permits it.

:::danger
Never accept `target`, `url`, provider credentials, arbitrary headers, or an unrestricted notification body from an untrusted client. Otherwise the endpoint becomes a credential relay or notification spam service.
:::

## Handle delivery asynchronously

For user-facing actions, consider validating the event, enqueueing it, and returning `202 Accepted`. A background worker can then deliver with retries without making page latency depend on the provider.

Keep authentication and event validation before enqueueing. Store a server-side event identifier so the worker can recognize duplicate jobs.

## When direct browser delivery is acceptable

Direct `statocysts/browser` delivery can be reasonable for Logger or a JSON endpoint intentionally designed for untrusted browser clients. It still requires compatible CORS and Content Security Policy configuration.

See the [compatibility reference](/statocysts/reference/compatibility/) before choosing direct delivery and [Security](/statocysts/guide/security/) for credential handling.
