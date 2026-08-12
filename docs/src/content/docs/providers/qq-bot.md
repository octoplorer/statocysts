---
title: QQ Bot
description: Send QQ Bot notifications to a user or group OpenID.
---

Protocol: `qqbot:`  
Runtime: Node.js and browser

## User target

```text
qqbot://<app-id>:<client-secret>@user/<user-openid>
```

## Group target

```text
qqbot://<app-id>:<client-secret>@group/<group-openid>
```

```ts
import { send } from 'statocysts'

await send(
  'qqbot://APP_ID:CLIENT_SECRET@group/GROUP_OPENID',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

Statocysts obtains an app access token and caches it in memory until shortly before expiration.

## Reply parameters

| Parameter  | Description                                    |
| ---------- | ---------------------------------------------- |
| `msg_id`   | Reply to a message ID.                         |
| `msg_seq`  | Message sequence number, parsed as an integer. |
| `event_id` | Associate the send with an event ID.           |

```text
qqbot://APP_ID:CLIENT_SECRET@user/USER_OPENID?msg_id=MESSAGE_ID&msg_seq=2
```

## Message format

A title-only notification is sent as text. When a body is present, the provider sends QQ Markdown with the title as a level-one heading.

## Provider options

```ts
import { qqbot } from 'statocysts'

await qqbot.send(target, notification, {
  apiBaseUrl: 'https://api.bot.qq.com',
  fetchOptions: { timeout: 5000 },
})
```
