---
title: Telegram
description: Send Telegram Bot API notifications to a chat, channel, or topic.
---

Protocol: `telegram:`  
Runtime: Node.js and browser

## Target format

```text
telegram://<bot-token>@bot/<chat-id>[:<message-thread-id>][?parse_mode=<mode>]
```

A Telegram token contains a colon and is encoded as URL username and password:

```text
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321
```

Channels can use an encoded username, and forum supergroups can append a topic ID:

```text
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/%40operations
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/-1001234567890:42
```

One target URL sends to one chat or topic.

## Parse mode

`parse_mode` accepts `Markdown`, `MarkdownV2`, or `HTML`:

```text
telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=HTML
```

When a body is present, the provider formats the title in bold and escapes title/body text for the selected mode.

## Provider options

```ts
import { telegram } from 'statocysts'

await telegram.send(target, notification, {
  apiBaseUrl: 'https://api.telegram.org',
  fetchOptions: { timeout: 5000 },
})
```
