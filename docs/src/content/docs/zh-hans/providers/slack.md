---
title: Slack
description: 通过传入 Webhook 或机器人令牌发送 Slack 通知。
---

协议：`slack:`  
运行时：Node.js 和浏览器

## 传入 Webhook 通知目标

```text
slack://webhook/<team-id>/<channel-id>/<webhook-token>
```

```ts
import { send } from 'statocysts'

await send(
  'slack://webhook/T00000000/B00000000/WEBHOOK_TOKEN',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

路径必须正好包含三段。查询参数会被转发到 Slack Webhook URL。

## 机器人通知目标

```text
slack://<channel-id>:<bot-token>@bot
```

```ts
await send(
  'slack://C00000000:xoxb-example-token@bot',
  { title: 'Deployment complete' },
)
```

频道 ID 是 URL 用户名，机器人令牌是 URL 密码。查询参数会被转发到 `chat.postMessage`。

## 通知格式

只有标题时会生成 Slack `text`。包含正文时，Statocysts 会发送标题区块和 Markdown 正文区块，并附带回退文本。

## 提供方专属选项

```ts
import { slack } from 'statocysts'

await slack.send(target, notification, {
  hookBaseUrl: 'https://hooks.slack.com/',
  botApiBaseUrl: 'https://slack.com/',
  fetchOptions: { timeout: 5000 },
})
```

`body` 可以替换完整的 Slack 请求体。只有在你明确负责 Slack 请求兼容性时才应使用。
