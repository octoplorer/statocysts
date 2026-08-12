---
title: 日志
description: 在开发和调试时将通知输出到控制台。
---

协议：`logger:`  
运行时：Node.js 和浏览器

日志提供方不会发起网络请求。

## 通知目标格式

```text
logger://[?level=<debug|info|warn|error>]
```

```ts
import { send } from 'statocysts'

await send('logger://?level=warn', {
  title: 'Queue delayed',
  body: 'The oldest job is five minutes old.',
})
```

`level` 默认为 `info`，并选择对应的 `console` 方法。

## 输出

```text
[statocysts] Queue delayed
The oldest job is five minutes old.
```

标题带有 `[statocysts]` 前缀，可选正文显示在下一行。

:::note
日志提供方适合测试通知运行时接线和通知格式。它不会持久化或投递任何内容，因此不应成为生产环境的唯一通知目标。
:::

日志提供方没有专属选项。
