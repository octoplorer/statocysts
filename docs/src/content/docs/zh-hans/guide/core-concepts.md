---
title: 核心概念
description: 了解通知、通知目标、通知提供方、通知器和通知运行时。
---

Statocysts 使用一组精简的概念，让通知投递与具体服务保持解耦。

## 通知

通知包含必填标题和可选正文：

```ts
interface Notification {
  title: string
  body?: string
}
```

标题必须是非空字符串。通知提供方负责将标题和正文转换成对应服务的请求内容。

## 通知目标

通知目标是一个协议 URL，它同时选择通知提供方并定位接收方：

```text
slack://webhook/T00000000/B00000000/WEBHOOK_TOKEN
```

`slack:` 等协议用于选择通知提供方，URL 的其余部分包含提供方专属的路由和凭据。可在[通知提供方参考](/statocysts/zh-hans/providers/)中查看经过测试的 URL 格式。

:::caution
通知目标 URL 通常包含凭据。请将其保存在密钥或环境变量中，从日志里移除敏感内容，并且不要把真实通知目标提交到版本控制系统。
:::

## 通知提供方

通知提供方理解一种协议，并将通知投递到匹配的通知目标。每个内置提供方都以具名对象形式导出：

```ts
import { slack } from 'statocysts'

await slack.send(target, notification, {
  fetchOptions: { timeout: 5000 },
})
```

需要提供方专属选项时，请直接调用对应提供方。需要统一分发和批量失败报告时，请使用顶层通知运行时 API。

## 通知器

通知器与一个或多个唯一通知目标绑定，可以重复使用：

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.JSON_TARGET!,
])

await notifier.send({ title: 'Deployment complete' })
```

每次发送都会并发尝试所有目标。单个目标失败不会阻止其他目标被尝试。

## 通知运行时

通知运行时注册内置通知提供方、校验目标协议，并导出 `send()` 和 `createNotifier()`。从 `statocysts` 导入会创建 Node.js 运行时；从 `statocysts/browser` 导入会创建浏览器兼容运行时。
