---
title: 错误处理
description: 区分通知目标设置错误和投递失败。
---

Statocysts 将通知目标设置错误与异步投递失败分开处理。

## 通知目标设置错误

以下情况会让 `createNotifier()` 同步抛出错误：

- 通知目标列表为空；
- 通知目标不是字符串或合法 URL；
- 标准化后的通知目标重复；
- 通知目标使用不受支持的协议；
- 通知目标缺少提供方要求的凭据或路径段，或者包含不支持的查询值。

```ts
import { createNotifier } from 'statocysts'

try {
  const notifier = createNotifier(['unsupported://recipient'])
  await notifier.send({ title: 'Test' })
}
catch (error) {
  console.error(error)
}
```

提供方专属目标校验是同步且仅在本地执行的。创建通知器不会构造传输 payload、获取远程令牌、生成发送时签名或访问通知提供方。这些设置错误会直接抛出，而不会包装成 `NotificationDeliveryError`。CLI 的 `verify` 命令采用相同边界。

## 投递失败

目标校验成功后，如果一个或多个投递在请求准备或传输阶段失败，顶层 `send()` 和通知器的 `.send()` 会抛出 `NotificationDeliveryError`：

```ts
import { NotificationDeliveryError, send } from 'statocysts'

try {
  await send(process.env.NOTIFICATION_TARGET!, {
    title: 'Backup failed',
  })
}
catch (error) {
  if (!(error instanceof NotificationDeliveryError)) {
    throw error
  }

  console.error({
    successCount: error.successCount,
    failureCount: error.failureCount,
    failures: error.failures,
  })
}
```

每个失败项都包含标准化后的通知目标和原始 `cause`。通知目标可能包含凭据，请不要将其完整写入日志。

## 直接调用通知提供方时的错误

具名通知提供方不会使用通知运行时的批量错误包装：

```ts
import { logger } from 'statocysts'

await logger.send('logger://?level=verbose', { title: 'Test' })
```

此调用会直接抛出日志提供方的查询参数校验错误。当你需要提供方专属的恢复逻辑时使用直接调用；需要所有目标共享统一失败模型时使用通知运行时。
