---
title: Telegram
description: 通过 Telegram Bot API 向会话、频道或话题发送通知。
---

协议：`telegram:`  
运行时：Node.js 和浏览器

## 通知目标格式

```text
telegram://<bot-token>@bot/<chat-id>[:<message-thread-id>][?parse_mode=<mode>]
```

Telegram 令牌包含冒号，会被编码为 URL 用户名和密码：

```text
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321
```

频道可以使用编码后的用户名；论坛超级群组可以追加话题 ID：

```text
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/%40operations
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/-1001234567890:42
```

一个通知目标 URL 只向一个会话或话题发送。

## 解析模式

`parse_mode` 可取 `Markdown`、`MarkdownV2` 或 `HTML`：

```text
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=HTML
```

包含正文时，通知提供方会将标题格式化为粗体，并按所选模式转义标题和正文。

## 提供方专属选项

```ts
import { telegram } from 'statocysts'

await telegram.send(target, notification, {
  apiBaseUrl: 'https://api.telegram.org',
  fetchOptions: { timeout: 5000 },
})
```
