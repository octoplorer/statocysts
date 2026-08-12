---
title: 多目标投递
description: 将通知分发到多个目标、检查部分失败并只重试失败目标。
---

当同一事件需要到达多个目的地时，请创建一个通知器：

```ts
import { createNotifier } from 'statocysts'

const operations = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
  process.env.EMAIL_TARGET!,
])

await operations.send({
  title: '服务已恢复',
  body: '事件：incident-2026-08-12-0142',
})
```

Statocysts 会并发尝试所有通知目标。单个失败不会阻止其他投递。

## 只重试失败目标

部分失败后复用原通知器，会再次向已经成功的目标发送通知。请改为使用 `error.failures` 创建临时通知器：

```ts
import {
  createNotifier,
  NotificationDeliveryError,
} from 'statocysts'

const notification = {
  title: '服务已恢复',
  body: '事件：incident-2026-08-12-0142',
}

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
  process.env.EMAIL_TARGET!,
])

try {
  await notifier.send(notification)
}
catch (error) {
  if (!(error instanceof NotificationDeliveryError)) {
    throw error
  }

  await new Promise(resolve => setTimeout(resolve, 1000))

  const retry = createNotifier(
    error.failures.map(failure => failure.target),
  )

  await retry.send(notification)
}
```

:::caution
如果通知提供方接受了第一次请求，但响应丢失，重试仍可能产生重复通知。Statocysts 不提供跨通知提供方的幂等保证。如果运维人员需要识别重复项，请在正文中加入稳定事件标识。
:::

## 设置重试预算

保持较少的重试次数，逐次增加等待时间，并停止重试永久性的校验或认证错误。通知提供方的 `cause` 类型是 `unknown`，因此只应分类当前提供方中你明确了解的错误结构。

生产重试循环应记录：

- 不含密钥的目的地标签；
- 尝试次数和经过时间；
- 通知提供方协议；
- 经过审查的错误类别；
- 最终成功或进入死信的结果。

不要记录 `failure.target`，其中可能包含凭据。参阅[安全](/statocysts/zh-hans/guide/security/)。

## 分离关键和尽力而为的目的地

当通知目标具有不同的投递策略时，请使用不同通知器：

```ts
const critical = createNotifier([
  process.env.ON_CALL_TARGET!,
])

const bestEffort = createNotifier([
  process.env.ACTIVITY_LOG_TARGET!,
  process.env.TEAM_CHAT_TARGET!,
])

await critical.send(notification)
await bestEffort.send(notification).catch(() => undefined)
```

这样可以明确表达策略：关键投递会阻塞工作流，尽力而为的投递不会。不要静默忽略关键失败。

## 复用长生命周期通知器

当通知目标配置稳定时，只需创建一次通知器。构造过程会规范化 URL、拒绝重复项，并在首次投递前将每个通知目标绑定到对应提供方。轮换或更改通知目标配置后，请重新创建通知器。
