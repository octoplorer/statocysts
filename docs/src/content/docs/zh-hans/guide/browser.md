---
title: 在浏览器中使用
description: 使用浏览器入口，并了解通知提供方和 CORS 限制。
---

使用独立的浏览器入口可以排除依赖 Node.js 的代码：

```ts
import { send } from 'statocysts/browser'

await send('jsons://example.com/notifications', {
  title: 'Browser event',
  body: 'A client-side task completed.',
})
```

## 可用的通知提供方

浏览器入口包含：

- Slack
- Discord
- 飞书和 Lark
- QQ 机器人
- Telegram
- Bark
- Server 酱
- JSON 和 JSONS
- 日志

邮件提供方需要 Node.js SMTP API，因此无法在浏览器中使用。

## CORS

支持浏览器运行并不代表远程通知服务允许浏览器跨域请求。通知目标服务必须返回兼容的 CORS 响应头；如果没有，请改为从服务端发送通知。

## 保护凭据

:::danger
不要把机器人令牌、Webhook 密钥、SMTP 凭据或私有通知目标放入浏览器构建产物。任何能够加载应用的人都可以检查这些内容。
:::

浏览器投递只适合公开或短期通知目标，以及专门面向不受信任客户端的端点。需要权限的通知应通过后端投递。

## 浏览器专用入口

在客户端代码中始终从 `statocysts/browser` 导入：

```ts
import {
  createNotifier,
  NotificationDeliveryError,
  send,
} from 'statocysts/browser'
```

通知运行时行为和错误类型与 Node.js 入口一致。签名请参阅 [API 参考](/statocysts/zh-hans/reference/api/)。
