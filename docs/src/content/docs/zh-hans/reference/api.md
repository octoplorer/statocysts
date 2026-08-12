---
title: API 参考
description: 公共通知运行时类型、函数、错误和通知提供方对象。
---

## `Notification`

```ts
interface Notification {
  title: string
  body?: string
}
```

`title` 必须是非空字符串，`body` 可选。

## `send(target, notification)`

```ts
function send(
  target: string,
  notification: Notification,
): Promise<void>
```

通过通知目标协议选中的提供方发送一条通知。提供方校验和传输失败通过 `NotificationDeliveryError` 报告。

## `createNotifier(targets)`

```ts
function createNotifier(targets: readonly string[]): Notifier

interface Notifier {
  send: (notification: Notification) => Promise<void>
}
```

创建一个绑定到一个或多个唯一通知目标的可复用通知器。每次调用都会并发尝试所有目标。

## `NotificationDeliveryError`

```ts
interface NotificationFailure {
  target: string
  cause: unknown
}

class NotificationDeliveryError extends Error {
  readonly failures: readonly NotificationFailure[]
  readonly successCount: number
  readonly failureCount: number
}
```

至少一个通知目标失败时，会在所有目标结束后抛出此错误。

## 通知提供方对象

包会导出每个通知提供方的对象：

```ts
import {
  bark,
  discord,
  email,
  json,
  jsons,
  lark,
  logger,
  qqbot,
  serverChan,
  slack,
  telegram,
} from 'statocysts'
```

每个通知提供方都公开协议和 `send()` 方法：

```ts
interface NotificationProvider<Protocol extends string, Options> {
  readonly protocol: Protocol
  send: (
    target: string,
    notification: Notification,
    options?: Options,
  ) => Promise<void>
}
```

提供方专属选项请参阅[通知提供方参考](/statocysts/zh-hans/providers/)。

## 浏览器入口

`statocysts/browser` 导出相同的通知运行时 API，以及邮件之外的所有通知提供方。
