---
title: Statocysts
description: A modern notification library for JavaScript.
template: splash
hero:
  tagline: The sensory organ for your infrastructure.
  actions:
    - text: Get started
      link: ./getting-started/
      variant: primary
    - text: View on GitHub
      link: https://github.com/octoplorer/statocysts
      variant: minimal
---

## Why Statocysts?

- **URL-based addressing** — identify every notification target with a protocol URL such as `slack://...`.
- **Parallel delivery** — attempt all targets concurrently without stopping after the first failure.
- **Actionable failures** — inspect every failed target through `NotificationDeliveryError`.
- **Multiple runtimes** — use the Node.js entry or the dedicated `statocysts/browser` entry.
- **CLI included** — send and verify notifications from a terminal with `stato`.

## Supported providers

Statocysts supports Slack, Discord, Lark, QQ Bot, Telegram, Bark, Server Chan, email, generic JSON endpoints, and local console logging.
