---
title: Discord
description: Send notifications through a Discord webhook.
---

Protocol: `discord:`  
Runtime: Node.js and browser

Official documentation: [Discord webhook resource](https://docs.discord.com/developers/resources/webhook#execute-webhook)

## Target format

```text
discord://<webhook-id>:<webhook-token>@webhook
```

```ts
import { send } from 'statocysts'

await send(
  'discord://123456789012345678:WEBHOOK_TOKEN@webhook',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

The webhook ID is URL username and the token is URL password.

## Query parameters

| Parameter    | Description                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------- |
| `username`   | Override the webhook display name.                                                            |
| `avatar_url` | Override the webhook avatar URL.                                                              |
| `wait`       | Add `wait=true` to Discord’s request when truthy. `false`, `0`, and an empty value are false. |

```text
discord://123456789012345678:WEBHOOK_TOKEN@webhook?username=Operations&wait=true
```

## Message format

A title-only notification becomes plain content. With a body, the content is formatted as a Markdown level-two heading followed by the body.

## Provider options

Direct `discord.send()` calls accept `fetchOptions`:

```ts
import { discord } from 'statocysts'

await discord.send(target, notification, {
  fetchOptions: { timeout: 5000 },
})
```
