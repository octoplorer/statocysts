## URL Scheme Format

Follow the [official Telegram Bot API documentation](https://core.telegram.org/bots/api) to create a bot and get the bot token.

```
telegram://<chat-id>:<bot-token>@bot[?parse_mode=<Markdown|MarkdownV2|HTML>]
```

### Parameters

- `chat-id`: The unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
- `bot-token`: Your Telegram Bot API token (e.g., `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Query Parameters

- `parse_mode`: Optional. Mode for parsing entities in the message text. Can be `Markdown`, `MarkdownV2`, or `HTML`
  - When `parse_mode` is set and the message has a body, the title will be formatted as bold text
  - In `MarkdownV2` mode, special characters in the title are automatically escaped
