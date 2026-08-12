---
title: Providers
description: Choose a notification provider and build a tested target URL.
---

A notification target’s protocol selects its provider. Choose a provider below for its tested URL format, query parameters, and direct-call options.

| Provider                                          | Protocol          | Runtime          | Target shape      |
| ------------------------------------------------- | ----------------- | ---------------- | ----------------- |
| [Slack](/statocysts/providers/slack/)             | `slack:`          | Node.js, browser | Webhook or bot    |
| [Discord](/statocysts/providers/discord/)         | `discord:`        | Node.js, browser | Webhook           |
| [Lark and Feishu](/statocysts/providers/lark/)    | `lark:`           | Node.js, browser | Webhook           |
| [QQ Bot](/statocysts/providers/qq-bot/)           | `qqbot:`          | Node.js, browser | User or group     |
| [Telegram](/statocysts/providers/telegram/)       | `telegram:`       | Node.js, browser | Bot chat or topic |
| [Bark](/statocysts/providers/bark/)               | `bark:`           | Node.js, browser | Device keys       |
| [Server Chan](/statocysts/providers/server-chan/) | `server-chan:`    | Node.js, browser | v3 or Turbo       |
| [Email](/statocysts/providers/email/)             | `email:`          | Node.js only     | SMTP recipients   |
| [JSON](/statocysts/providers/json/)               | `json:`, `jsons:` | Node.js, browser | HTTP endpoint     |
| [Logger](/statocysts/providers/logger/)           | `logger:`         | Node.js, browser | Console output    |

## Target security

Most provider targets contain credentials. Keep complete URLs in environment variables or secret stores, redact them in errors and logs, and rotate a credential immediately if it is exposed.

## Runtime APIs and direct calls

Use top-level `send()` or `createNotifier()` for protocol routing and consistent batch errors. Import a named provider when you need provider-specific options:

```ts
import { slack } from 'statocysts'

await slack.send(process.env.SLACK_TARGET!, notification, {
  fetchOptions: { timeout: 5000 },
})
```
