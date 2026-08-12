---
title: 通知提供方
description: 选择通知提供方并构建经过测试的通知目标 URL。
---

通知目标的协议用于选择通知提供方。以下页面包含经过测试的 URL 格式、查询参数和直接调用选项。

| 通知提供方                                              | 协议              | 运行时          | 通知目标类型     |
| ------------------------------------------------------- | ----------------- | --------------- | ---------------- |
| [Slack](/statocysts/zh-hans/providers/slack/)           | `slack:`          | Node.js、浏览器 | Webhook 或机器人 |
| [Discord](/statocysts/zh-hans/providers/discord/)       | `discord:`        | Node.js、浏览器 | Webhook          |
| [飞书和 Lark](/statocysts/zh-hans/providers/lark/)      | `lark:`           | Node.js、浏览器 | Webhook          |
| [QQ 机器人](/statocysts/zh-hans/providers/qq-bot/)      | `qqbot:`          | Node.js、浏览器 | 用户或群         |
| [Telegram](/statocysts/zh-hans/providers/telegram/)     | `telegram:`       | Node.js、浏览器 | 机器人会话或话题 |
| [Bark](/statocysts/zh-hans/providers/bark/)             | `bark:`           | Node.js、浏览器 | 设备密钥         |
| [Server 酱](/statocysts/zh-hans/providers/server-chan/) | `server-chan:`    | Node.js、浏览器 | v3 或 Turbo      |
| [邮件](/statocysts/zh-hans/providers/email/)            | `email:`          | 仅 Node.js      | SMTP 收件人      |
| [JSON](/statocysts/zh-hans/providers/json/)             | `json:`、`jsons:` | Node.js、浏览器 | HTTP 端点        |
| [日志](/statocysts/zh-hans/providers/logger/)           | `logger:`         | Node.js、浏览器 | 控制台输出       |

## 通知目标安全

大多数通知目标都包含凭据。请将完整 URL 保存在环境变量或密钥存储中，从错误和日志里移除敏感内容，并在凭据暴露后立即轮换。

## 通知运行时 API 和直接调用

使用顶层 `send()` 或 `createNotifier()` 可以获得协议分发和统一的批量错误。需要提供方专属选项时，请导入具名通知提供方：

```ts
import { slack } from 'statocysts'

await slack.send(process.env.SLACK_TARGET!, notification, {
  fetchOptions: { timeout: 5000 },
})
```
