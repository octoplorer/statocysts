---
title: Statocysts
description: 一个现代的 JavaScript 通知库。
template: splash
hero:
  tagline: 基础设施的「感觉器官」。
  actions:
    - text: 快速开始
      link: /statocysts/zh-hans/getting-started/
      variant: primary
    - text: 查看 GitHub
      link: https://github.com/octoplorer/statocysts
      variant: minimal
---

## 为什么选择 Statocysts？

- **基于 URL 的目标寻址** —— 使用 `slack://...` 等协议 URL 标识每个通知目标。
- **并行投递** —— 并发尝试所有目标，不会在首次失败后停止。
- **可定位的失败信息** —— 通过 `NotificationDeliveryError` 检查每个失败目标。
- **支持多种运行时** —— 可使用 Node.js 入口或独立的 `statocysts/browser` 入口。
- **内置 CLI** —— 在终端中使用 `stato` 发送通知和校验通知目标。

## 支持的通知提供方

Statocysts 支持 Slack、Discord、飞书、QQ 机器人、Telegram、Bark、Server 酱、邮件、通用 JSON 端点和本地控制台日志。

## 浏览文档

- [了解核心概念](/statocysts/zh-hans/guide/core-concepts/)
- [发送并复用通知](/statocysts/zh-hans/guide/sending-notifications/)
- [选择通知提供方](/statocysts/zh-hans/providers/)
- [使用命令行界面](/statocysts/zh-hans/reference/cli/)
