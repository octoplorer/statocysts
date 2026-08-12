# Statocysts

A modern notification library for JavaScript. As the sensory organ for your infrastructure.

Highly inspired by [shoutrrr](https://github.com/containrrr/shoutrrr) and [apprise](https://github.com/caronc/apprise).

[![NPM Version](https://img.shields.io/npm/v/statocysts)](https://npmjs.com/statocysts)
![npm bundle size](https://img.shields.io/bundlephobia/min/statocysts)
![GitHub License](https://img.shields.io/github/license/octoplorer/statocysts)

## Installation

### Using npm

```bash
npm install statocysts
```

### Using the CLI

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
