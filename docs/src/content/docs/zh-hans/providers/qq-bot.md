---
title: QQ 机器人
description: 向用户或群 OpenID 发送 QQ 机器人通知。
---

协议：`qqbot:`  
运行时：Node.js 和浏览器

官方文档：[发送单聊消息](https://bot.q.qq.com/wiki/develop/api-v2/autogen/api/v2_users_user_openid_messages.post.html)、[发送群聊消息](https://bot.q.qq.com/wiki/develop/api-v2/autogen/api/v2_groups_group_openid_messages.post.html)

## 用户通知目标

```text
qqbot://<app-id>:<client-secret>@user/<user-openid>
```

## 群通知目标

```text
qqbot://<app-id>:<client-secret>@group/<group-openid>
```

```ts
import { send } from 'statocysts'

await send(
  'qqbot://APP_ID:CLIENT_SECRET@group/GROUP_OPENID',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

Statocysts 会获取应用访问令牌，并在内存中缓存到过期前一小段时间。

## 回复参数

| 参数       | 描述                       |
| ---------- | -------------------------- |
| `msg_id`   | 回复指定消息 ID。          |
| `msg_seq`  | 消息序号，会解析为整数。   |
| `event_id` | 将发送操作与事件 ID 关联。 |

```text
qqbot://APP_ID:CLIENT_SECRET@user/USER_OPENID?msg_id=MESSAGE_ID&msg_seq=2
```

## 通知格式

只有标题时会发送文本。包含正文时，会发送 QQ Markdown，并将标题作为一级标题。

## 提供方专属选项

```ts
import { qqbot } from 'statocysts'

await qqbot.send(target, notification, {
  apiBaseUrl: 'https://api.bot.qq.com',
  fetchOptions: { timeout: 5000 },
})
```
