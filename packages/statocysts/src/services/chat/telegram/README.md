## URL Scheme Format

Follow the [official Telegram Bot API documentation](https://core.telegram.org/bots/api) to create a bot and get the bot token.

```
telegram://<bot-token>@bot/<chat-id>[:<message-thread-id>][?parse_mode=<Markdown|MarkdownV2|HTML>]
```

### Parameters

- `bot-token`: Your Telegram Bot API token (e.g., `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)
- `chat-id`: The unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
- `message-thread-id`: Optional. Unique identifier for the target message thread (topic) in a forum supergroup

### Query Parameters

- `parse_mode`: Optional. Mode for parsing entities in the message text. Can be `Markdown`, `MarkdownV2`, or `HTML`
  - When `parse_mode` is set and the message has a body, the title will be formatted as bold text
  - In `MarkdownV2` mode, special characters in the title are automatically escaped

### Examples

Basic message to a chat:

```
telegram://123456789:ABC-DEF1234ghIkl@bot/123456789
```

Message to a channel with Markdown formatting:

```
telegram://123456789:ABC-DEF1234ghIkl@bot/@mychannel?parse_mode=Markdown
```

Message with HTML formatting:

```
telegram://123456789:ABC-DEF1234ghIkl@bot/123456789?parse_mode=HTML
```

Message to a specific topic in a forum group:

```
telegram://123456789:ABC-DEF1234ghIkl@bot/-1001234567890:42
```

Where `-1001234567890` is the chat ID and `42` is the message thread ID (topic ID).
