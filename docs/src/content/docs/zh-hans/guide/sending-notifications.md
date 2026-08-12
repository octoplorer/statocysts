---
title: 发送通知
description: 单次发送、复用通知目标并配置具体通知提供方。
---

## 发送到一个目标

一次性投递可以使用 `send()`：

```ts
import { send } from 'statocysts'

await send(process.env.SLACK_TARGET!, {
  title: 'Deployment complete',
  body: 'Version 0.14.0 is now live.',
})
```

`send()` 会校验目标协议、尝试投递，并在投递失败时抛出 `NotificationDeliveryError`。

## 复用通知器

需要向同一组通知目标多次投递时，可以创建通知器：

```ts
import { createNotifier } from 'statocysts'

const operations = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
])

await operations.send({ title: 'Deployment started' })
await operations.send({ title: 'Deployment complete' })
```

通知目标必须唯一。创建通知器时，通知运行时会拒绝空目标列表、非法 URL、重复的标准化 URL 和不支持的协议。

## 处理部分失败

所有通知目标都会被并发尝试。批次完成后，可以检查每个失败目标：

```ts
import { createNotifier, NotificationDeliveryError } from 'statocysts'

try {
  await operations.send({ title: 'Service recovered' })
}
catch (error) {
  if (error instanceof NotificationDeliveryError) {
    console.error(`${error.failureCount} deliveries failed`)

    for (const failure of error.failures) {
      console.error(failure.target, failure.cause)
    }
  }
  else {
    throw error
  }
}
```

有关校验和投递错误的边界，请阅读[错误处理](/statocysts/zh-hans/guide/error-handling/)。

## 配置通知提供方

如果选项不适合放在通知目标中，可以调用具名通知提供方：

```ts
import { telegram } from 'statocysts'

await telegram.send(
  process.env.TELEGRAM_TARGET!,
  { title: 'Deployment complete' },
  {
    apiBaseUrl: 'https://api.telegram.org',
    fetchOptions: { timeout: 5000 },
  },
)
```

直接调用通知提供方时，原始校验或传输错误不会被包装成 `NotificationDeliveryError`。
