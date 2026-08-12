[**English**](README.md) | [简体中文](README_zh-hans.md)

# Statocysts

A modern notification library for JavaScript. As the sensory organ for your infrastructure.

Highly inspired by [shoutrrr](https://github.com/containrrr/shoutrrr) and [apprise](https://github.com/caronc/apprise).

[![NPM Version](https://img.shields.io/npm/v/statocysts)](https://npmjs.com/statocysts)
![npm bundle size](https://img.shields.io/bundlephobia/min/statocysts)
![GitHub License](https://img.shields.io/github/license/octoplorer/statocysts)

## Features

- **URL-based addressing** — every notification target is identified by a protocol URL (e.g. `slack://...`), so adding or switching services never requires a code change.
- **Parallel delivery** — all targets of a notifier are attempted concurrently.
- **Partial failure reporting** — a failed batch rejects with a `NotificationDeliveryError` that details exactly which targets failed and why.
- **Provider-specific options** — per-send overrides such as timeouts, base URLs, and custom payloads.
- **Runtime agnostic** — works in Node.js and modern browsers (dedicated `statocysts/browser` entry).
- **Zero-config CLI** — send or verify notification URLs straight from your terminal with `stato`.

## Installation

### Library

```bash
npm install statocysts
```

### CLI

```bash
npm install -g @statocysts/cli
```

## Quick Start

### Send once

```typescript
import { send } from 'statocysts'

await send('slack://webhook/xxx/yyy/zzz', {
  title: 'Hello World',
  body: 'Optional details',
})
```

### Send repeatedly to multiple targets

```typescript
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  'slack://webhook/xxx/yyy/zzz',
  'json://example.com/api/endpoint',
])

await notifier.send({ title: 'Hello World' })
```

All targets are attempted in parallel. A partial or complete failure rejects with `NotificationDeliveryError` after every target has completed.

### Use provider-specific options

```typescript
import { telegram } from 'statocysts'

await telegram.send(
  'telegram://token@bot/chat-id',
  { title: 'Hello World' },
  { fetchOptions: { timeout: 5000 } },
)
```

### Debug with the logger provider

```typescript
import { send } from 'statocysts'

await send('logger://', {
  title: 'Hello World',
  body: 'Printed to the console for development',
})
// [statocysts] Hello World
// Printed to the console for development
```

The logger provider writes to the console without any network requests. Use `logger://?level=warn` (or `debug`/`error`) to pick the output level.

### Using the CLI

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -t "Hello World"
```

### Verify a URL before sending

```bash
stato verify -u "slack://webhook/xxx/yyy/zzz"
```

## Supported Providers

| Provider    | Protocol           | Target URL format                                                                                           |
| ----------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Slack       | `slack:`           | `slack://webhook/xxx/yyy/zzz` or `slack://bot@channel:token`                                                |
| Discord     | `discord:`         | `discord://webhook@<webhook-id>:<token>`                                                                    |
| Lark        | `lark:`            | `lark://webhook@<token>[:<secret>]`                                                                         |
| QQ Bot      | `qqbot:`           | `qqbot://user@<app-id>:<client-secret>/<openid>` or `qqbot://group@<app-id>:<client-secret>/<group-openid>` |
| Telegram    | `telegram:`        | `telegram://bot@<token>/<chat-id-1>/<chat-id-2>`                                                            |
| Bark        | `bark:`            | `bark://<server>/<device-key-1>/<device-key-2>`                                                             |
| Server Chan | `server-chan:`     | `server-chan://v3@<uid>:<send-key>` or `server-chan://turbo@<send-key>`                                     |
| Email       | `email:`           | `email://<user>:<password>@<host>:<port>?to=...&from=...&subject=...`                                       |
| JSON        | `json:` / `jsons:` | `json://example.com/api/endpoint` (HTTP) / `jsons://...` (HTTPS)                                            |
| Logger      | `logger:`          | `logger://?level=debug\|info\|warn\|error`                                                                  |

### Customizing JSON requests

The JSON providers accept extra query parameters to customize the outgoing request:

- A parameter key starting with a space (e.g. `%20Authorization`) is sent as a request header.
- A parameter key starting with `:` (e.g. `:channel`) is added to the JSON body.

```bash
stato -u 'json://example.com/api?%20Authorization=Bearer%20xxx&:channel=ops' -t "Hello World"
```

## API

### `Notification`

```typescript
interface Notification {
  title: string
  body?: string
}
```

The title is required and must be a non-empty string; the body is optional.

### `send(target, notification)`

Sends a single notification to one target.

```typescript
declare function send(target: string, notification: Notification): Promise<void>
```

### `createNotifier(targets)`

Creates a reusable notifier bound to one or more targets. All targets are attempted in parallel on every `send`.

```typescript
declare function createNotifier(targets: readonly string[]): Notifier
declare function notifierSend(notification: Notification): Promise<void>
```

Targets must be unique and use a registered protocol. An unsupported or malformed target rejects at creation time.

### `NotificationDeliveryError`

Thrown when at least one target fails to deliver. Inspect the failure details after all targets have completed:

```typescript
try {
  await notifier.send({ title: 'Hello World' })
}
catch (error) {
  if (error instanceof NotificationDeliveryError) {
    console.error(`Failed: ${error.failureCount}/${error.successCount + error.failureCount}`)
    for (const failure of error.failures) {
      console.error(`- ${failure.target}: ${failure.cause}`)
    }
  }
}
```

- `failures: readonly NotificationFailure[]` — `{ target, cause }` pairs for every failed target
- `successCount: number` — number of targets that succeeded
- `failureCount: number` — number of targets that failed

### Provider objects

Every provider is also exported as a standalone object with the same `send` signature, which accepts provider-specific options:

```typescript
import { slack, telegram } from 'statocysts'

await slack.send('slack://webhook/xxx/yyy/zzz', notification)
await telegram.send('telegram://bot@token/chat-id', notification, {
  fetchOptions: { timeout: 5000 },
})
```

Most HTTP-based providers accept `fetchOptions`; some accept additional options such as `apiBaseUrl` (Telegram, QQ Bot, Slack) or `hookBaseUrl` (Slack). Refer to the type definitions for each provider.

## Browser Support

Import from the browser entry to use Statocysts in the browser:

```typescript
import { send } from 'statocysts/browser'

await send('json://example.com/api/endpoint', { title: 'Hello World' })
```

The browser entry only includes providers that do not depend on Node.js APIs. `email` and `logger` are not available in the browser.

## CLI Reference

```
stato [verify] -u <url> [-t <title>] [-b <body> | -f <file>]
```

| Command     | Description                                        |
| ----------- | -------------------------------------------------- |
| _(default)_ | Send a notification (no subcommand).               |
| `verify`    | Verify that notification service URL(s) are valid. |

| Option      | Alias | Description                                                   |
| ----------- | ----- | ------------------------------------------------------------- |
| `--url`     | `-u`  | Notification service URL(s). Can be specified multiple times. |
| `--title`   | `-t`  | Notification title (required when sending).                   |
| `--body`    | `-b`  | Notification body content.                                    |
| `--file`    | `-f`  | Read body content from a file.                                |
| `--help`    |       | Show help information.                                        |
| `--version` |       | Show version number.                                          |

The body content is resolved in this order: `--body` → `--file` → stdin.

```bash
# Send with a title and body
stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -b "Hello World"

# Send to multiple URLs at once
stato -u "slack://webhook/xxx/yyy/zzz" -u "json://example.com/api" -t "Alert" -b "Hello"

# Read the body from a file
stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -f message.txt

# Pipe the body from stdin
echo "Hello World" | stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert"

# Verify URLs without sending anything
stato verify -u "slack://webhook/xxx/yyy/zzz"
# ✓ slack://webhook/xxx/yyy/zzz
```

`stato verify` exits with code `0` when every URL is valid and `1` when any URL is invalid.

## License

[MIT](https://github.com/octoplorer/statocysts/blob/main/LICENSE)
