[**English**](README.md) | [简体中文](README_zh-hans.md)

# Statocysts

A modern notification library for JavaScript — the sensory organ for your infrastructure.

[![NPM Version](https://img.shields.io/npm/v/statocysts)](https://npmjs.com/statocysts)
![npm bundle size](https://img.shields.io/bundlephobia/min/statocysts)
![GitHub License](https://img.shields.io/github/license/octoplorer/statocysts)

## Features

- **URL-based addressing** — select a provider and recipient with one notification target URL.
- **Parallel delivery** — attempt every target concurrently.
- **Actionable failures** — inspect each failed target through `NotificationDeliveryError`.
- **Provider-specific options** — configure timeouts, API bases, and request payloads.
- **Node.js and browser entries** — import only providers supported by your runtime.
- **Command-line interface** — send and verify targets with `stato`.

## Install

```sh
pnpm add statocysts
```

## Quick start

```ts
import { send } from 'statocysts'

await send('slack://webhook/T00000000/B00000000/WEBHOOK_TOKEN', {
  title: 'Deployment complete',
  body: 'Production is healthy.',
})
```

Reuse a notifier for multiple targets:

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
])

await notifier.send({ title: 'Service recovered' })
```

All targets are attempted. If any delivery fails, the promise rejects with `NotificationDeliveryError` after the complete batch settles.

## Browser

```ts
import { send } from 'statocysts/browser'
```

The browser entry includes every provider except email. Remote services must allow browser-origin requests, and privileged target credentials should stay on your server.

## CLI

```sh
pnpm add --global @statocysts/cli

stato -u "$NOTIFICATION_TARGET" -t "Deployment complete"
stato verify -u "$NOTIFICATION_TARGET"
```

## Providers

Slack, Discord, Lark/Feishu, QQ Bot, Telegram, Bark, Server Chan, email, HTTP/HTTPS JSON endpoints, and local console logging are included.

Notification target URLs often contain credentials. Keep them in environment variables or secret stores and redact them from logs.

## Documentation

Read the full documentation at [octoplorer.github.io/statocysts](https://octoplorer.github.io/statocysts/):

- [Getting started](https://octoplorer.github.io/statocysts/getting-started/)
- [Core concepts](https://octoplorer.github.io/statocysts/guide/core-concepts/)
- [Provider reference](https://octoplorer.github.io/statocysts/providers/)
- [API reference](https://octoplorer.github.io/statocysts/reference/api/)
- [CLI reference](https://octoplorer.github.io/statocysts/reference/cli/)

## License

[MIT](https://github.com/octoplorer/statocysts/blob/master/LICENSE)
