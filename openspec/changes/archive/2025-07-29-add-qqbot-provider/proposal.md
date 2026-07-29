## Why

QQ Bot（QQ 机器人）是腾讯官方提供的消息推送通道，支持单聊和群聊场景。当前 statocysts 已覆盖 Slack、Telegram、Discord、Lark 等主流 IM 平台，但缺少对 QQ 生态的支持。添加 QQ Bot provider 可以让中国用户通过 QQ 接收通知消息，填补重要的生态空白。

## What Changes

- 新增 `qqbot` chat provider，支持通过 QQ Bot OpenAPI 发送单聊和群聊消息
- URL 格式：`qqbot://APPID:CLIENTSECRET@user/OPENID`（单聊）和 `qqbot://APPID:CLIENTSECRET@group/OPENID`（群聊）
- 自动管理 access_token：用 AppID + ClientSecret 换取 token，带内存缓存并在过期前自动刷新
- 仅 title → 纯文本消息（msg_type=0），title + body → Markdown 消息（msg_type=2）
- 支持通过 URL query 参数传递 `msg_id`/`msg_seq`/`event_id` 实现被动回复

## Capabilities

### New Capabilities

- `qqbot-provider`: QQ Bot 消息推送能力，支持单聊和群聊两种场景，自动管理 access_token 生命周期

### Modified Capabilities

（无——这是新增 provider，不修改现有能力）

## Impact

- 新增文件：`packages/statocysts/src/services/chat/qqbot/index.ts`（实现）
- 新增文件：`packages/statocysts/src/services/chat/qqbot/index.spec.ts`（测试）
- 修改文件：`packages/statocysts/src/index.ts`（注册 qqbot provider）
- 修改文件：`packages/statocysts/src/browser.ts`（浏览器入口注册 qqbot）
- 依赖：复用现有 `ofetch`、`http` transport、`defineProvider` 框架，无新增依赖
