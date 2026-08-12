---
title: 安全
sidebar:
  label: 安全
  order: 6
description: 在服务端、浏览器、CI、错误和日志中保护通知凭据。
---

通知目标经常在用户名、密码、路径或查询字符串中包含凭据。除非通知提供方明确说明，否则应将每个完整的通知目标 URL 都视为密钥。

## 将通知目标留在服务端

把特权通知目标保存在环境变量或托管密钥存储中，并且只在可信的服务端代码中读取：

```ts
import { send } from 'statocysts'

const target = process.env.NOTIFICATION_TARGET

if (!target) {
  throw new Error('NOTIFICATION_TARGET is required')
}

await send(target, { title: '部署完成' })
```

不要将通知目标提交到源代码仓库、放进前端环境变量或写入生成的静态文件。`PUBLIC_`、`NEXT_PUBLIC_` 和 `VITE_` 等前缀通常会把变量暴露到浏览器产物中。

:::danger
在前端构建期间注入的密钥仍然是公开信息。任何可以加载应用的人都能检查 JavaScript 和网络请求。
:::

如果客户端事件需要触发特权通知，请使用[服务端浏览器代理](/statocysts/zh-hans/recipes/browser-proxy/)。

## 避免泄露通知目标

`NotificationDeliveryError.failures` 包含规范化后的通知目标 URL，以便应用识别失败的目的地。不要将完整失败对象发送到日志、遥测、错误追踪服务或 API 响应中。

请记录稳定的本地标签或协议：

```ts
const targets = [
  { name: 'operations-slack', url: process.env.SLACK_TARGET! },
  { name: 'on-call-telegram', url: process.env.TELEGRAM_TARGET! },
]

const targetNames = new Map(
  targets.map(({ name, url }) => [new URL(url).toString(), name]),
)
```

投递失败后，使用 `targetNames.get(failure.target)`，不要记录 `failure.target`。将 HTTP 客户端异常转发到遥测服务前也要检查错误消息，因为其中可能包含请求 URL。

## 优先使用加密传输

- JSON 端点使用代表 HTTPS 的 `jsons:`。只在可信本地网络和开发环境使用 `json:`。
- 为 SMTP 保持 TLS 开启，并确认邮件服务器配置正确。
- 生产环境不要将通知提供方 API 基础 URL 替换成未加密端点。
- 不要通过关闭 TLS 证书校验绕过配置错误。

传输加密只能保护传输中的通知目标，不能让它变得适合出现在浏览器或日志中。

## 限制凭据泄露的影响

- 为每个环境使用独立的机器人、Webhook 或 SMTP 账号。
- 只授予发送通知所必需的权限。
- 分离生产、预览和开发环境的通知目标。
- 凭据意外泄露或协作者不再需要访问时立即轮换。
- 撤销不再使用的通知目标，不要让它们长期闲置。

在 CI 中，通过平台的密钥机制传递通知目标，并给通知任务设置最小令牌权限。参阅 [GitHub Actions 配方](/statocysts/zh-hans/recipes/github-actions/)。

## 校验不可信输入

不要允许浏览器或公开 API 调用者提交任意通知目标。服务端应从固定允许列表中选择通知目标，对调用者进行认证，限制请求频率，并将允许的事件名映射到服务端拥有的通知文案。

如果通知中包含用户输入：

- 设置长度限制；
- 不要在通知正文中放入密钥或个人信息；
- 考虑通知提供方的格式化规则；
- 调用 Statocysts 前拒绝不支持的事件结构。

## 处理凭据泄露

1. 撤销或轮换受影响的通知提供方凭据。
2. 尽可能从源码、日志、产物和错误追踪服务中移除凭据。
3. 替换所有部署环境中的值。
4. 检查通知提供方审计日志中是否存在异常投递。
5. 增加密钥扫描或结构化脱敏等预防措施。

如果密钥仍然存在于 Git 历史中，只从最新提交删除并不充分。仓库历史受到影响时，请遵循代码托管平台的密钥移除流程。

## 生产检查清单

- [ ] 完整通知目标只存在于密钥存储或服务端环境中。
- [ ] 浏览器代码不会收到特权通知目标。
- [ ] 日志使用标签而不是通知目标 URL。
- [ ] 生产传输使用 TLS。
- [ ] 凭据遵循最小权限并按环境分离。
- [ ] 公开通知接口会认证调用者并限制频率。
- [ ] 已明确凭据轮换和事故响应负责人。
