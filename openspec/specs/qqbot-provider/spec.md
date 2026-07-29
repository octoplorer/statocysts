# QQ Bot Provider

## Purpose

定义 QQ 机器人通知提供方的协议地址、鉴权缓存、消息投递及服务端与浏览器端可用性。

## Requirements

### Requirement: QQ Bot Provider 注册

系统 SHALL 以 `qqbot:` 协议将 QQ 机器人通知提供方纳入服务端与浏览器端的内置提供方目录，并 SHALL 通过两个环境入口顶层命名导出 `qqbot`。QQ 机器人通知提供方 SHALL 遵循统一通知模型和具体提供方接口。

#### Scenario: Provider 在通知运行时中可用

- **WHEN** 用户通过 `createNotifier` 或顶层 `send` 使用 `qqbot:` 协议的通知目标
- **THEN** 通知运行时找到并调用 QQ 机器人通知提供方处理该目标

#### Scenario: Provider 可直接调用

- **WHEN** 用户从服务端或浏览器端入口导入 `qqbot`
- **THEN** 用户可以直接投递结构化通知并传入 QQ 机器人专属选项

### Requirement: URL 格式解析

系统 SHALL 从 URL 中解析以下信息：

- `username`（AppID）和 `password`（ClientSecret）作为认证凭据
- `hostname` 为 `user`（单聊）或 `group`（群聊）
- `pathname` 部分为目标 OpenID

#### Scenario: 解析单聊 URL

- **WHEN** 提供 URL `qqbot://12345:secret@user/OPENID123`
- **THEN** 解析出 AppID=`12345`、ClientSecret=`secret`、chatType=`user`、openid=`OPENID123`

#### Scenario: 解析群聊 URL

- **WHEN** 提供 URL `qqbot://12345:secret@group/OPENID456`
- **THEN** 解析出 AppID=`12345`、ClientSecret=`secret`、chatType=`group`、openid=`OPENID456`

#### Scenario: 无效 hostname 应抛出错误

- **WHEN** 提供 URL `qqbot://12345:secret@invalid/OPENID`
- **THEN** 抛出错误，提示 hostname 必须为 `user` 或 `group`

#### Scenario: 缺少 AppID 应抛出错误

- **WHEN** 提供 URL `qqbot://:secret@user/OPENID`
- **THEN** 抛出错误，提示 App ID 为必填

#### Scenario: 缺少 ClientSecret 应抛出错误

- **WHEN** 提供 URL `qqbot://12345:@user/OPENID`
- **THEN** 抛出错误，提示 Client Secret 为必填

### Requirement: Access Token 自动获取与缓存

系统 SHALL 使用 AppID 和 ClientSecret 向 `{apiBaseUrl}/app/getAppAccessToken` 发送 POST 请求换取 access_token。系统 SHALL 在内存中缓存 token，并在过期前 60 秒自动刷新。

#### Scenario: 首次调用获取新 token

- **WHEN** 缓存中不存在对应的 token
- **THEN** 向 token 端点发起 POST 请求，携带 `{ appId, clientSecret }`，缓存返回的 token 及其过期时间

#### Scenario: 缓存命中直接使用

- **WHEN** 缓存中存在未过期的 token（且距离过期超过 60 秒）
- **THEN** 直接使用缓存中的 token，不发起 token 请求

#### Scenario: 接近过期时自动刷新

- **WHEN** 缓存中的 token 距离过期不足 60 秒
- **THEN** 发起新的 token 请求，用新 token 替换缓存

### Requirement: 消息发送 — 单聊

系统 SHALL 向 `{apiBaseUrl}/v2/users/{user_openid}/messages` 发送 POST 请求，携带 `Authorization: QQBot {token}` 头和 JSON 消息体。

#### Scenario: 发送纯文本单聊消息（仅 title）

- **WHEN** 调用 `qqbot.send('qqbot://app:secret@user/OPENID', { title: '你好世界' })`
- **THEN** 发送 POST 请求到 `/v2/users/OPENID/messages`，请求体为 `{ msg_type: 0, content: '你好世界' }`，Header 包含 `Authorization: QQBot <token>`

#### Scenario: 发送 Markdown 单聊消息（title + body）

- **WHEN** 调用 `qqbot.send('qqbot://app:secret@user/OPENID', { title: '告警', body: 'CPU > 90%' })`
- **THEN** 发送 POST 请求到 `/v2/users/OPENID/messages`，请求体为 `{ msg_type: 2, markdown: { content: '# 告警\n\nCPU > 90%' } }`

### Requirement: 消息发送 — 群聊

系统 SHALL 向 `{apiBaseUrl}/v2/groups/{group_openid}/messages` 发送 POST 请求。

#### Scenario: 发送纯文本群聊消息

- **WHEN** 调用 `qqbot.send('qqbot://app:secret@group/OPENID', { title: '群通知' })`
- **THEN** 发送 POST 请求到 `/v2/groups/OPENID/messages`，请求体为 `{ msg_type: 0, content: '群通知' }`

#### Scenario: 发送 Markdown 群聊消息

- **WHEN** 调用 `qqbot.send('qqbot://app:secret@group/OPENID', { title: '群通知', body: '内容' })`
- **THEN** 发送 POST 请求到 `/v2/groups/OPENID/messages`，请求体为 `{ msg_type: 2, markdown: { content: '# 群通知\n\n内容' } }`

### Requirement: 被动回复支持

系统 SHALL 支持从 URL query 参数中提取 `msg_id`、`msg_seq`、`event_id`，并将其放入请求体以实现被动回复。

#### Scenario: 携带 msg_id 和 msg_seq 的被动回复

- **WHEN** 提供 URL `qqbot://app:secret@user/OPENID?msg_id=ROBOT1.0_xxx&msg_seq=2`
- **THEN** 请求体中包含 `msg_id: "ROBOT1.0_xxx"` 和 `msg_seq: 2`

#### Scenario: 携带 event_id 的事件回复

- **WHEN** 提供 URL `qqbot://app:secret@user/OPENID?event_id=EVENT_xxx`
- **THEN** 请求体中包含 `event_id: "EVENT_xxx"`

### Requirement: apiBaseUrl 可配置

系统 SHALL 允许通过 options 参数覆盖 API 基础 URL，默认值为 `https://api.bot.qq.com`。

#### Scenario: 使用默认 API 基础 URL

- **WHEN** 未提供 `apiBaseUrl` options
- **THEN** token 端点和消息端点均使用 `https://api.bot.qq.com` 作为基础 URL

#### Scenario: 覆盖 API 基础 URL

- **WHEN** 提供 options `{ apiBaseUrl: 'https://sandbox.bot.qq.com' }`
- **THEN** 所有 API 请求使用 `https://sandbox.bot.qq.com` 作为基础 URL

### Requirement: 浏览器环境可用

系统 SHALL 在浏览器内置提供方目录中包含 QQ 机器人通知提供方，因为其运行时依赖在浏览器环境中可用。

#### Scenario: 浏览器入口导出并注册 qqbot

- **WHEN** 从 `statocysts/browser` 导入
- **THEN** `qqbot` 作为顶层命名导出可用，且浏览器通知运行时能识别 `qqbot:` 协议
