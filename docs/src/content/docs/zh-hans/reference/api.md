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

校验通知目标，并通过协议选中的提供方发送一条通知。本地目标或提供方校验失败会在投递开始前以原始错误拒绝；请求准备和传输失败通过 `NotificationDeliveryError` 报告。

## `createNotifier(targets)`

```ts
function createNotifier(targets: readonly string[]): Notifier

interface Notifier {
  send: (notification: Notification) => Promise<void>
}
```

同步校验一个或多个唯一通知目标，并创建绑定到其已校验提供方状态的可复用通知器。创建过程不会调用传输或远程服务。每次调用都会并发尝试所有已绑定目标。

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

所有目标通过创建时校验后，如果至少一个投递失败，会在全部目标结束后抛出此错误。

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

每个通知提供方都公开协议、同步 `validate()` 方法和 `send()` 方法：

```ts
interface NotificationProvider<Protocol extends string, Options> {
  readonly protocol: Protocol
  validate: (
    target: string,
    options?: Options,
  ) => ValidatedNotificationTarget
  send: (
    target: string,
    notification: Notification,
    options?: Options,
  ) => Promise<void>
}

interface ValidatedNotificationTarget {
  send: (notification: Notification) => Promise<void>
}
```

`validate()` 会检查 URL、协议和提供方专属本地规则，并将合并后的选项保存在可复用绑定中。它不会访问通知提供方，也不会确认凭据和接收者是否真实存在。提供方 `send()` 会先执行相同校验，再准备并发送传输 payload。

提供方专属选项请参阅[通知提供方参考](/statocysts/zh-hans/providers/)。

## 浏览器入口

`statocysts/browser` 导出相同的通知运行时 API，以及邮件之外的所有通知提供方。
