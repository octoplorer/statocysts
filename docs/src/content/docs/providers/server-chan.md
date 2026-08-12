---
title: Server Chan
description: Send notifications through Server Chan 3 or Server Chan Turbo.
---

Protocol: `server-chan:`  
Runtime: Node.js and browser

Official documentation: [Server Chan 3 API](https://doc.sc3.ft07.com/zh/serverchan3/server/api), [Server Chan Turbo](https://sct.ftqq.com/sendkey/)

## Server Chan 3

```text
server-chan://<uid>:<send-key>@v3[?tags=<tag>&short=<summary>]
```

Repeat `tags` to send multiple tags; Statocysts joins them with `|`:

```text
server-chan://UID:SEND_KEY@v3?tags=operations&tags=production&short=Recovered
```

## Server Chan Turbo

```text
server-chan://ftqq:<send-key>@turbo[?short=<summary>&noip=<value>&channel=<channel>&openid=<openid>]
```

The `ftqq` username is conventional but not used in the request. `noip` becomes `1` for `1` or `true`, and `0` otherwise.

```ts
import { send } from 'statocysts'

await send(
  'server-chan://ftqq:SEND_KEY@turbo?noip=1',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

## Message format

The notification title is sent as `title`; the optional body is sent as `desp`.

## Provider options

Direct `serverChan.send()` calls accept `fetchOptions`:

```ts
import { serverChan } from 'statocysts'

await serverChan.send(target, notification, {
  fetchOptions: { timeout: 5000 },
})
```
