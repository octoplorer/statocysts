---
title: Discord
description: 通过 Discord Webhook 发送通知。
---

协议：`discord:`  
运行时：Node.js 和浏览器

## 通知目标格式

```text
discord://<webhook-id>:<webhook-token>@webhook
```

```ts
import { send } from 'statocysts'

await send(
  'discord://123456789012345678:WEBHOOK_TOKEN@webhook',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

Webhook ID 是 URL 用户名，令牌是 URL 密码。

## 查询参数

| 参数         | 描述                                                               |
| ------------ | ------------------------------------------------------------------ |
| `username`   | 覆盖 Webhook 显示名称。                                            |
| `avatar_url` | 覆盖 Webhook 头像 URL。                                            |
| `wait`       | 值为真时向 Discord 请求添加 `wait=true`；`false`、`0` 和空值为假。 |

```text
discord://123456789012345678:WEBHOOK_TOKEN@webhook?username=Operations&wait=true
```

## 通知格式

只有标题时会生成纯文本；包含正文时，会生成 Markdown 二级标题和正文。

## 提供方专属选项

直接调用 `discord.send()` 可以传入 `fetchOptions`：

```ts
import { discord } from 'statocysts'

await discord.send(target, notification, {
  fetchOptions: { timeout: 5000 },
})
```
