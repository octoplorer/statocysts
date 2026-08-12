---
title: Lark and Feishu
description: Send signed or unsigned Lark and Feishu webhook notifications.
---

Protocol: `lark:`  
Runtime: Node.js and browser

## Target format

```text
lark://<webhook-token>[:<signing-secret>]@webhook[?domain=feishu]
```

LarkSuite webhook:

```text
lark://WEBHOOK_TOKEN@webhook
```

Signed Feishu webhook:

```text
lark://WEBHOOK_TOKEN:SIGNING_SECRET@webhook?domain=feishu
```

`domain=feishu` selects `open.feishu.cn`. Without it, the provider uses `open.larksuite.com`.

## Message format

A title-only notification becomes a text message. When a body is present, the provider creates an interactive card with the title in its header and the body as Markdown.

When a signing secret is present, Statocysts generates the timestamp and HMAC-SHA256 signature required by the webhook.

## Provider options

Direct `lark.send()` calls accept:

```ts
import { lark } from 'statocysts'

await lark.send(target, notification, {
  baseUrl: 'https://open.larksuite.com',
  fetchOptions: { timeout: 5000 },
})
```

Use `baseUrl` for testing or a compatible proxy; normal Lark/Feishu selection should use the `domain` query parameter.
