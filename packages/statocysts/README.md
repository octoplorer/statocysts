# Statocysts

A modern notification library for JavaScript. As the sensory organ for your infrastructure.

Highly inspired by [shoutrrr](https://github.com/containrrr/shoutrrr) and [apprise](https://github.com/caronc/apprise).

[![NPM Version](https://img.shields.io/npm/v/statocysts)](https://npmjs.com/statocysts)
![npm bundle size](https://img.shields.io/bundlephobia/min/statocysts)
![GitHub License](https://img.shields.io/github/license/octoplorer/statocysts)

## Installation

### using npm

```bash
npm install statocysts
```

### ussing CLI

```bash
npm install -g @statocysts/cli
```

## Quick Start

### As a package

```typescript
import { send } from 'statocysts'

await send('slack://webhook/xxx/yyy/zzz', 'Hello World')
```

```typescript
import { createSender } from 'statocysts'

const sender = createSender([
  'slack://webhook/xxx/yyy/zzz',
  'json://example.com/api/endpoint',
])

sender.send('Hello World')
```

### Using CLI

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -m "Hello World"
```
