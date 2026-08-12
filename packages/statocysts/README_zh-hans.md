[English](README.md) | [**简体中文**](README_zh-hans.md)

# Statocysts

一个现代的 JavaScript 通知库,堪称基础设施的「感觉器官」。

深受 [shoutrrr](https://github.com/containrrr/shoutrrr) 与 [apprise](https://github.com/caronc/apprise) 的启发。

[![NPM Version](https://img.shields.io/npm/v/statocysts)](https://npmjs.com/statocysts)
![npm bundle size](https://img.shields.io/bundlephobia/min/statocysts)
![GitHub License](https://img.shields.io/github/license/octoplorer/statocysts)

## 特性

- **基于 URL 的目标寻址** —— 每个通知目标都由一个协议 URL(如 `slack://...`)标识,新增或切换通知服务无需改动任何代码。
- **并行投递** —— 通知器的所有目标会被并发尝试。
- **部分失败报告** —— 投递失败时抛出 `NotificationDeliveryError`,精确指出哪些目标失败及失败原因。
- **提供方专属选项** —— 支持按次覆盖超时、API 地址、自定义请求体等。
- **运行环境无关** —— 同时支持 Node.js 与现代浏览器(提供独立的 `statocysts/browser` 入口)。
- **零配置 CLI** —— 在终端里用 `stato` 直接发送或校验通知 URL。

## 安装

### 库

```bash
npm install statocysts
```

### CLI

```bash
npm install -g @statocysts/cli
```

## 快速开始

### 发送一次

```typescript
import { send } from 'statocysts'

await send('slack://webhook/xxx/yyy/zzz', {
  title: 'Hello World',
  body: 'Optional details',
})
```

### 复用通知器,发送到多个目标

```typescript
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  'slack://webhook/xxx/yyy/zzz',
  'json://example.com/api/endpoint',
])

await notifier.send({ title: 'Hello World' })
```

所有目标都会被并行尝试。在全部目标完成后,若存在部分或全部失败,则抛出 `NotificationDeliveryError`。

### 使用提供方专属选项

```typescript
import { telegram } from 'statocysts'

await telegram.send(
  'telegram://token@bot/chat-id',
  { title: 'Hello World' },
  { fetchOptions: { timeout: 5000 } },
)
```

### 用 logger 提供方调试

```typescript
import { send } from 'statocysts'

await send('logger://', {
  title: 'Hello World',
  body: 'Printed to the console for development',
})
// [statocysts] Hello World
// Printed to the console for development
```

logger 提供方不发起任何网络请求,仅向控制台输出。使用 `logger://?level=warn`(或 `debug`/`error`)选择输出级别。

### 使用 CLI

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -t "Hello World"
```

### 发送前校验 URL

```bash
stato verify -u "slack://webhook/xxx/yyy/zzz"
```

## 支持的提供方

| 提供方     | 协议               | 目标 URL 格式                                                                                               |
| ---------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Slack      | `slack:`           | `slack://webhook/xxx/yyy/zzz` 或 `slack://bot@channel:token`                                                |
| Discord    | `discord:`         | `discord://webhook@<webhook-id>:<token>`                                                                    |
| Lark(飞书) | `lark:`            | `lark://webhook@<token>[:<secret>]`                                                                         |
| QQ 机器人  | `qqbot:`           | `qqbot://user@<app-id>:<client-secret>/<openid>` 或 `qqbot://group@<app-id>:<client-secret>/<group-openid>` |
| Telegram   | `telegram:`        | `telegram://bot@<token>/<chat-id-1>/<chat-id-2>`                                                            |
| Bark       | `bark:`            | `bark://<server>/<device-key-1>/<device-key-2>`                                                             |
| Server 酱  | `server-chan:`     | `server-chan://v3@<uid>:<send-key>` 或 `server-chan://turbo@<send-key>`                                     |
| 邮件       | `email:`           | `email://<user>:<password>@<host>:<port>?to=...&from=...&subject=...`                                       |
| JSON       | `json:` / `jsons:` | `json://example.com/api/endpoint`(HTTP)/ `jsons://...`(HTTPS)                                               |
| 日志       | `logger:`          | `logger://?level=debug\|info\|warn\|error`                                                                  |

### 自定义 JSON 请求

JSON 提供方支持通过额外的查询参数定制发出的请求:

- 键名以空格开头的参数(如 `%20Authorization`)会作为请求头发送。
- 键名以 `:` 开头的参数(如 `:channel`)会追加到 JSON 请求体中。

```bash
stato -u 'json://example.com/api?%20Authorization=Bearer%20xxx&:channel=ops' -t "Hello World"
```

## API

### `Notification`

```typescript
interface Notification {
  title: string
  body?: string
}
```

`title` 必填且必须是非空字符串,`body` 可选。

### `send(target, notification)`

向单个目标发送一条通知。

```typescript
declare function send(target: string, notification: Notification): Promise<void>
```

### `createNotifier(targets)`

创建一个绑定到一个或多个目标、可复用的通知器。每次 `send` 都会并行尝试所有目标。

```typescript
declare function createNotifier(targets: readonly string[]): Notifier
declare function notifierSend(notification: Notification): Promise<void>
```

目标必须唯一,且使用已注册的协议。目标不受支持或格式非法时,会在创建阶段直接报错。

### `NotificationDeliveryError`

当至少一个目标投递失败时抛出。在所有目标完成后,可检查失败详情:

```typescript
try {
  await notifier.send({ title: 'Hello World' })
}
catch (error) {
  if (error instanceof NotificationDeliveryError) {
    console.error(`Failed: ${error.failureCount}/${error.successCount + error.failureCount}`)
    for (const failure of error.failures) {
      console.error(`- ${failure.target}: ${failure.cause}`)
    }
  }
}
```

- `failures: readonly NotificationFailure[]` —— 每个失败目标的 `{ target, cause }`
- `successCount: number` —— 投递成功的目标数量
- `failureCount: number` —— 投递失败的目标数量

### 提供方对象

每个提供方也作为独立对象导出,提供相同的 `send` 签名,并可传入提供方专属选项:

```typescript
import { slack, telegram } from 'statocysts'

await slack.send('slack://webhook/xxx/yyy/zzz', notification)
await telegram.send('telegram://bot@token/chat-id', notification, {
  fetchOptions: { timeout: 5000 },
})
```

大多数基于 HTTP 的提供方接受 `fetchOptions`,部分还接受额外选项,如 `apiBaseUrl`(Telegram、QQ Bot、Slack)或 `hookBaseUrl`(Slack)。详情请参阅各提供方的类型定义。

## 浏览器支持

在浏览器中使用时,请从浏览器入口导入:

```typescript
import { send } from 'statocysts/browser'

await send('json://example.com/api/endpoint', { title: 'Hello World' })
```

浏览器入口仅包含不依赖 Node.js API 的提供方。`email` 与 `logger` 在浏览器中不可用。

## CLI 参考

```
stato [verify] -u <url> [-t <title>] [-b <body> | -f <file>]
```

| 命令     | 描述                        |
| -------- | --------------------------- |
| _(默认)_ | 发送通知(无子命令)。        |
| `verify` | 校验通知服务 URL 是否合法。 |

| 选项        | 别名 | 描述                      |
| ----------- | ---- | ------------------------- |
| `--url`     | `-u` | 通知服务 URL,可多次指定。 |
| `--title`   | `-t` | 通知标题(发送时必填)。    |
| `--body`    | `-b` | 通知正文。                |
| `--file`    | `-f` | 从文件读取正文内容。      |
| `--help`    |      | 显示帮助信息。            |
| `--version` |      | 显示版本号。              |

正文内容按以下优先级解析:`--body` → `--file` → 标准输入。

```bash
# 发送带标题和正文的通知
stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -b "Hello World"

# 同时发送到多个 URL
stato -u "slack://webhook/xxx/yyy/zzz" -u "json://example.com/api" -t "Alert" -b "Hello"

# 从文件读取正文
stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -f message.txt

# 从标准输入管道传入正文
echo "Hello World" | stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert"

# 校验 URL,不实际发送
stato verify -u "slack://webhook/xxx/yyy/zzz"
# ✓ slack://webhook/xxx/yyy/zzz
```

`stato verify` 在所有 URL 均合法时以退出码 `0` 结束,任一 URL 非法时以 `1` 结束。

## 许可证

[MIT](https://github.com/octoplorer/statocysts/blob/main/LICENSE)
