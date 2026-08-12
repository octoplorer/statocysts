---
title: 兼容性
sidebar:
  label: 兼容性
  order: 3
description: 比较运行时导出、浏览器限制、凭据和通知提供方专属选项。
---

## 运行时要求

| 运行时  | 入口                 | 要求                                                         |
| ------- | -------------------- | ------------------------------------------------------------ |
| Node.js | `statocysts`         | Node.js 24.12.0 或更高版本                                   |
| 浏览器  | `statocysts/browser` | ES2020，以及现代 URL、Request、Headers、Fetch 和 Promise API |

浏览器入口会排除 Email 和 Node.js SMTP 代码。通知提供方从浏览器入口导出，只代表其实现可以在浏览器中运行，并不保证远程 API 允许跨源请求，也不代表凭据适合公开。

## 通知提供方矩阵

| 通知提供方   | 协议              | Node.js | 浏览器导出 | 浏览器直接调用建议                             |
| ------------ | ----------------- | :-----: | :--------: | ---------------------------------------------- |
| Slack        | `slack:`          |    ✓    |     ✓      | 推荐服务端；通知目标包含 Webhook 或机器人凭据  |
| Discord      | `discord:`        |    ✓    |     ✓      | 推荐服务端；通知目标包含 Webhook 凭据          |
| 飞书和 Lark  | `lark:`           |    ✓    |     ✓      | 推荐服务端；通知目标可能包含签名密钥           |
| QQ 机器人    | `qqbot:`          |    ✓    |     ✓      | 实际应仅在服务端使用；通知目标包含应用密钥     |
| Telegram     | `telegram:`       |    ✓    |     ✓      | 推荐服务端；通知目标包含机器人令牌             |
| Bark         | `bark:`           |    ✓    |     ✓      | 推荐服务端；设备密钥用于标识推送接收者         |
| Server 酱    | `server-chan:`    |    ✓    |     ✓      | 推荐服务端；通知目标包含 SendKey               |
| 邮件         | `email:`          |    ✓    |     —      | 仅 Node.js；依赖 SMTP API                      |
| JSON / JSONS | `json:`、`jsons:` |    ✓    |     ✓      | 只适合支持 CORS 且按照客户端信任级别设计的端点 |
| 日志         | `logger:`         |    ✓    |     ✓      | 适合本地诊断；会将通知内容写入控制台           |

:::note
“推荐服务端”是安全建议，而不是打包限制。每个通知提供方的 CORS 行为需要单独确认，因为远程策略可以独立于 Statocysts 发生变化。
:::

## 浏览器决策指南

只有同时满足以下条件时才应直接从浏览器投递：

- 通知目标不含特权或长期凭据；
- 远程端点明确接受应用所在的源；
- 内容安全策略允许对应连接；
- 允许不可信用户触发这个目的地；
- 可以接受通知提供方的频率限制和滥用控制。

否则请使用[浏览器代理配方](/statocysts/zh-hans/recipes/browser-proxy/)。

## 通知提供方选项

| 通知提供方   | 直接调用选项                             |
| ------------ | ---------------------------------------- |
| Slack        | `fetchOptions`                           |
| Discord      | `fetchOptions`                           |
| 飞书和 Lark  | `fetchOptions`                           |
| QQ 机器人    | `apiBaseUrl`、`fetchOptions`             |
| Telegram     | `apiBaseUrl`、`fetchOptions`             |
| Bark         | `fetchOptions`                           |
| Server 酱    | `fetchOptions`                           |
| 邮件         | `defaultFrom`、`smtpConfig`              |
| JSON / JSONS | 直接将 `FetchOptions` 作为第三个参数传入 |
| 日志         | 无                                       |

顶层 `send()` 和 `createNotifier()` 有意只提供统一运行时 API，不接受通知提供方专属选项。需要上述选项时，请导入具名通知提供方。

## 能力说明

- 所有 HTTP 通知提供方都通过 `ofetch` 使用平台 Fetch 栈。
- Email 使用 SMTP，不包含在 `statocysts/browser` 中。
- JSON 的 `json:` 使用 HTTP，`jsons:` 使用 HTTPS。
- 运行时多目标投递使用 `Promise.allSettled()` 并等待所有目的地完成。
- 通知提供方 API 和浏览器 CORS 策略可能在 Statocysts 未发布新版本时发生变化。

如需通知目标格式和查询参数，请打开对应的[通知提供方参考](/statocysts/zh-hans/providers/)。
