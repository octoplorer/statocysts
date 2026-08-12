[English](README.md) | [**简体中文**](README_zh-hans.md)

# Statocysts

一个现代的 JavaScript 通知库——基础设施的「感觉器官」。

[![NPM Version](https://img.shields.io/npm/v/statocysts)](https://npmjs.com/statocysts)
![npm bundle size](https://img.shields.io/bundlephobia/min/statocysts)
![GitHub License](https://img.shields.io/github/license/octoplorer/statocysts)

## 特性

- **基于 URL 的目标寻址** —— 使用一个通知目标 URL 选择通知提供方和接收方。
- **并行投递** —— 并发尝试所有通知目标。
- **可定位的失败信息** —— 通过 `NotificationDeliveryError` 检查每个失败目标。
- **提供方专属选项** —— 配置超时、API 地址和请求内容。
- **Node.js 和浏览器入口** —— 只导入当前运行时支持的通知提供方。
- **命令行界面** —— 使用 `stato` 发送通知和校验通知目标。

## 安装

```sh
pnpm add statocysts
```

## 快速开始

```ts
import { send } from 'statocysts'

await send('slack://webhook/T00000000/B00000000/WEBHOOK_TOKEN', {
  title: 'Deployment complete',
  body: 'Production is healthy.',
})
```

复用通知器向多个通知目标发送：

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
])

await notifier.send({ title: 'Service recovered' })
```

所有通知目标都会被尝试。如果存在投递失败，Promise 会在整个批次结束后抛出 `NotificationDeliveryError`。

## 浏览器

```ts
import { send } from 'statocysts/browser'
```

浏览器入口包含邮件之外的所有通知提供方。远程服务必须允许浏览器跨域请求，含有权限的通知目标凭据应留在服务端。

## CLI

```sh
pnpm add --global @statocysts/cli

stato -u "$NOTIFICATION_TARGET" -t "Deployment complete"
stato verify -u "$NOTIFICATION_TARGET"
```

## 通知提供方

内置 Slack、Discord、飞书/Lark、QQ 机器人、Telegram、Bark、Server 酱、邮件、HTTP/HTTPS JSON 端点和本地控制台日志。

通知目标 URL 通常包含凭据。请将其保存在环境变量或密钥存储中，并从日志里移除敏感内容。

## 文档

完整文档位于 [octoplorer.github.io/statocysts](https://octoplorer.github.io/statocysts/zh-hans/)：

- [快速开始](https://octoplorer.github.io/statocysts/zh-hans/getting-started/)
- [核心概念](https://octoplorer.github.io/statocysts/zh-hans/guide/core-concepts/)
- [通知提供方参考](https://octoplorer.github.io/statocysts/zh-hans/providers/)
- [API 参考](https://octoplorer.github.io/statocysts/zh-hans/reference/api/)
- [CLI 参考](https://octoplorer.github.io/statocysts/zh-hans/reference/cli/)

## 许可证

[MIT](https://github.com/octoplorer/statocysts/blob/master/LICENSE)
