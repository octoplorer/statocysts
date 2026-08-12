---
title: 浏览器代理
description: 从浏览器触发特权通知，同时将通知目标保留在服务端。
---

浏览器应向后端提交一个小型、经过认证的事件。后端校验事件，选择服务端拥有的通知目标，并调用 Node.js 入口。

## 服务端处理函数

以下与框架无关的处理函数只接受允许列表中的一个事件。请根据所用路由调整请求和响应约定：

```ts
import { send } from 'statocysts'

const notifications = {
  'export-complete': {
    target: process.env.OPERATIONS_TARGET,
    title: '导出完成',
  },
} as const

type EventName = keyof typeof notifications

export async function handleNotificationRequest(
  request: Request,
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const input: unknown = await request.json()

  if (
    typeof input !== 'object'
    || input === null
    || !('event' in input)
    || typeof input.event !== 'string'
    || !(input.event in notifications)
  ) {
    return Response.json({ error: 'Invalid event' }, { status: 400 })
  }

  const event = input.event as EventName
  const notification = notifications[event]

  if (!notification.target) {
    return Response.json({ error: 'Server is not configured' }, { status: 503 })
  }

  await send(notification.target, { title: notification.title })

  return new Response(null, { status: 204 })
}
```

客户端只选择事件名，而不是通知目标 URL、通知提供方、接收者、标题或任意请求选项。

## 浏览器请求

```ts
const response = await fetch('/api/notifications', {
  method: 'POST',
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ event: 'export-complete' }),
})

if (!response.ok) {
  throw new Error('Unable to request notification delivery')
}
```

## 必需的生产控制

这个最小处理函数只用于展示信任边界，不是完整的公开接口。请添加适合应用的控制措施：

- 认证调用者并检查事件权限；
- 为基于 Cookie 认证的请求增加 CSRF 防护；
- 按账号和来源限制频率；
- 设置较小的请求正文上限；
- 将事件映射到服务端拥有的文案和通知目标；
- 返回不包含提供方凭据的通用错误；
- 记录不含密钥的审计标识；
- 在产品流程允许时防止重复提交。

:::danger
绝不能接受不可信客户端传入的 `target`、`url`、通知提供方凭据、任意请求头或不受限制的通知正文，否则这个接口会变成凭据中继或通知垃圾发送服务。
:::

## 异步处理投递

对于面向用户的操作，可以在校验事件后将其加入队列并返回 `202 Accepted`。后台工作进程随后可以执行带重试的投递，而不会让页面延迟依赖通知提供方。

认证和事件校验必须发生在入队之前。保存服务端事件标识，让工作进程能够识别重复任务。

## 何时可以直接从浏览器投递

对于 Logger 或者专门为不可信浏览器客户端设计的 JSON 端点，可以考虑直接通过 `statocysts/browser` 投递。它仍然需要兼容的 CORS 和内容安全策略配置。

选择直接投递前请查看[兼容性参考](/statocysts/zh-hans/reference/compatibility/)，并通过[安全](/statocysts/zh-hans/guide/security/)了解凭据处理。
