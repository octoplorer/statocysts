---
title: Server 酱
description: 通过 Server 酱 3 或 Turbo 发送通知。
---

协议：`server-chan:`  
运行时：Node.js 和浏览器

## Server 酱 3

```text
server-chan://<uid>:<send-key>@v3[?tags=<tag>&short=<summary>]
```

重复 `tags` 可以发送多个标签，Statocysts 会使用 `|` 连接：

```text
server-chan://UID:SEND_KEY@v3?tags=operations&tags=production&short=Recovered
```

## Server 酱 Turbo

```text
server-chan://ftqq:<send-key>@turbo[?short=<summary>&noip=<value>&channel=<channel>&openid=<openid>]
```

`ftqq` 用户名是约定写法，但不会进入请求。`noip` 为 `1` 或 `true` 时转换为 `1`，其他值转换为 `0`。

```ts
import { send } from 'statocysts'

await send(
  'server-chan://ftqq:SEND_KEY@turbo?noip=1',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

## 通知格式

通知标题作为 `title`，可选正文作为 `desp`。

## 提供方专属选项

直接调用 `serverChan.send()` 可以传入 `fetchOptions`：

```ts
import { serverChan } from 'statocysts'

await serverChan.send(target, notification, {
  fetchOptions: { timeout: 5000 },
})
```
