## Context

statocysts 是一个统一的多渠道通知库，采用 provider 模式。每个通知渠道通过 `defineProvider(protocol, options)` 注册，使用 URL 编码传递认证信息和目标地址（如 `slack://TOKEN@bot/CHANNEL`），通过 `transport` 发送网络请求。

QQ Bot 是腾讯官方的 QQ 机器人 API，提供单聊和群聊消息推送能力。与现有 provider 不同的是，QQ Bot 不直接使用长期有效的 API key——它需要将 AppID + ClientSecret 换为有效期 7200 秒的 access_token，且需要在过期前刷新。

## Goals / Non-Goals

**Goals:**

- 实现 `qqbot:` 协议 provider，支持通过 URL 指定 AppID、ClientSecret 和消息目标
- 支持单聊（`user`）和群聊（`group`）两种场景
- 自动管理 access_token：获取、缓存、过期前刷新
- 支持纯文本和 Markdown 两种消息类型
- 支持被动回复（携带 `msg_id`/`msg_seq`/`event_id`）
- 与现有 provider 保持一致的代码风格和测试模式

**Non-Goals:**

- 不支持频道（channel）消息
- 不支持流式消息（streaming）
- 不支持富媒体消息（需要先上传文件，超出推送通知场景）
- 不支持 card/ARK 消息
- 不持久化 token（仅内存缓存，进程重启后重新获取）

## Decisions

### 1. URL 格式

```
qqbot://APPID:CLIENTSECRET@user/OPENID       ← 单聊
qqbot://APPID:CLIENTSECRET@group/OPENID      ← 群聊
```

- `username` = AppID
- `password` = ClientSecret
- `hostname` = `user` 或 `group`（区分单聊/群聊）
- `pathname` = 目标 OpenID

**备选方案**：直接用 access_token 嵌入 URL（`qqbot://TOKEN@user/OPENID`）。不采用，因为 token 仅 2 小时有效，不适合持久化配置。

### 2. Token 管理

```
┌─────────────────────────────────────────────────────┐
│  Token Cache (module-level Map)                     │
│                                                     │
│  key = `${appId}:${clientSecret}`                   │
│  val = { token: string, expiresAt: number }        │
│                                                     │
│  getAccessToken()                                   │
│    ├─ cache hit && not near expiry → return cached  │
│    └─ cache miss → POST /app/getAppAccessToken      │
│                    → cache & return                  │
│                                                     │
│  Refresh threshold: expiresAt - 60s                 │
│  (matches QQ Bot API: new token issued 60s before   │
│   expiry, old token remains valid during window)    │
└─────────────────────────────────────────────────────┘
```

- 使用模块级 `Map`，所有调用共享缓存
- 不处理并发去重（两个同时刷新的请求各发一次，开销可接受）
- 不做持久化（进程重启重新获取）

### 3. 消息类型映射

| 输入         | msg_type | 请求体                                                      |
| ------------ | -------- | ----------------------------------------------------------- |
| 仅 title     | 0        | `{ msg_type: 0, content: title }`                           |
| title + body | 2        | `{ msg_type: 2, markdown: { content: "# Title\n\nBody" } }` |

QQ Bot Markdown 支持标准 Markdown 语法（标题、粗体、斜体、链接、代码块、列表、引用等），无需额外转义。

### 4. Query 参数处理

URL query 参数 `msg_id`、`msg_seq`、`event_id` 会被提取并放入请求体，实现被动回复：

```
qqbot://APPID:CLIENTSECRET@user/OPENID?msg_id=ROBOT1.0_xxx&msg_seq=1
→ { msg_type: 0, content: "...", msg_id: "ROBOT1.0_xxx", msg_seq: 1 }
```

### 5. 错误处理

沿用现有 provider 模式——不做特殊错误处理，让 `ofetch` 抛出异常。QQ Bot 会在 HTTP 响应体中返回 `err_code` 和 `message`，调用方可通过捕获异常来获取。

## Risks / Trade-offs

| 风险                                                                                     | 缓解                                                                                                                                |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Token 端点域名可能不是 `api.bot.qq.com`（文档不一致：`api.bot.qq.com` vs `bots.qq.com`） | 提供 `apiBaseUrl` 选项允许覆盖，默认用 `api.bot.qq.com`（API 调用指南中明确指定的统一地址）                                         |
| ClientSecret 含 `:` 字符导致 URL 解析错误                                                | 当前 QQ 开放平台的 ClientSecret 均为 hex 字符串，不含 `:`。如未来变化，可参考 Telegram provider 用 `url.username:url.password` 拼接 |
| 内存缓存在 serverless 环境下可能命中率低                                                 | 每个冷启动仅多一次 token 请求（2s 内完成），影响可控                                                                                |

## Open Questions

- 无
