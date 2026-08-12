---
title: 快速开始
description: 安装 Statocysts 并发送第一条通知。
---

## 安装通知库

```sh
pnpm add statocysts
```

你也可以使用 npm、Yarn 或 Bun 安装。

## 发送第一条通知

导入 `send`，然后传入通知目标、标题和可选正文：

```ts
import { send } from 'statocysts'

await send('slack://webhook/xxx/yyy/zzz', {
  title: 'Deployment complete',
  body: 'Version 0.14.0 is now live.',
})
```

每个通知目标都由协议 URL 表示。协议用于选择通知提供方，URL 的其余部分用于定位接收方。

## 复用多个通知目标

需要向相同目标重复投递时，可以创建通知器：

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  'slack://webhook/xxx/yyy/zzz',
  'jsons://example.com/notifications',
])

await notifier.send({ title: 'Service recovered' })
```

所有目标都会被并行尝试。如果存在投递失败，Statocysts 会在全部目标完成后抛出 `NotificationDeliveryError`。

## 安装 CLI

```sh
pnpm add --global @statocysts/cli
```

直接在终端中发送通知：

```sh
stato -u "slack://webhook/xxx/yyy/zzz" -t "Deployment complete"
```

校验通知 URL 而不实际发送：

```sh
stato verify -u "slack://webhook/xxx/yyy/zzz"
```
