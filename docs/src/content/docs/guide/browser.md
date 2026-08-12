---
title: Browser usage
description: Use the browser entry and understand provider and CORS constraints.
---

Import the dedicated browser entry to exclude Node.js-only code:

```ts
import { send } from 'statocysts/browser'

await send('jsons://example.com/notifications', {
  title: 'Browser event',
  body: 'A client-side task completed.',
})
```

## Available providers

The browser entry includes:

- Slack
- Discord
- Lark and Feishu
- QQ Bot
- Telegram
- Bark
- Server Chan
- JSON and JSONS
- Logger

Email is unavailable because it requires Node.js SMTP APIs.

## CORS

Browser support does not guarantee that a remote notification service permits browser-origin requests. The target service must return compatible CORS headers. If it does not, send the notification from your server instead.

## Protect credentials

:::danger
Do not embed bot tokens, webhook secrets, SMTP credentials, or private notification targets in browser bundles. Anyone who can load the application can inspect them.
:::

Browser delivery is appropriate for public or short-lived targets and endpoints designed for untrusted clients. Route privileged notifications through your backend.

## Browser-specific import

Always use `statocysts/browser` in client code:

```ts
import {
  createNotifier,
  NotificationDeliveryError,
  send,
} from 'statocysts/browser'
```

The runtime behavior and error types match the Node.js entry. See the [API reference](/statocysts/reference/api/) for their signatures.
