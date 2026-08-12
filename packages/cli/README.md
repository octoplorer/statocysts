# @statocysts/cli

Command-line interface for [statocysts](https://github.com/octoplorer/statocysts) notification library.

## Installation

```bash
npm install -g @statocysts/cli
# or
pnpm add -g @statocysts/cli
```

## Usage

```bash
stato -u <url> -t <title> [-b <body> | -f <file>]
stato verify -u <url> [-u <url2> ...]
```

### Commands

| Command     | Description                                        |
| ----------- | -------------------------------------------------- |
| _(default)_ | Send a notification (no subcommand).               |
| `verify`    | Verify that notification service URL(s) are valid. |

### Options

| Option      | Alias | Description                                                   |
| ----------- | ----- | ------------------------------------------------------------- |
| `--url`     | `-u`  | Notification service URL(s). Can be specified multiple times. |
| `--title`   | `-t`  | Notification title (required when sending).                   |
| `--body`    | `-b`  | Notification body content.                                    |
| `--file`    | `-f`  | Read body content from a file.                                |
| `--help`    |       | Show help information.                                        |
| `--version` |       | Show version number.                                          |

### Body Priority

The body content is determined in the following order:

1. `--body` argument (highest priority)
2. `--file` argument
3. Standard input (stdin)

## Examples

### Send to a single URL

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -b "Hello World"
```

### Send to multiple URLs

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -u "json://example.com/api/notify" -t "Alert" -b "Hello World"
```

### Read body from file

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -f message.txt
```

### Read body from stdin

```bash
echo "Hello World" | stato -u "slack://webhook/xxx/yyy/zzz" -t "Alert"
```

### Verify URL(s)

Verify that notification service URL(s) can be resolved and use a registered protocol, without sending anything:

```bash
stato verify -u "slack://webhook/xxx/yyy/zzz"
# ✓ slack://webhook/xxx/yyy/zzz
```

```bash
stato verify -u "slack://webhook/xxx/yyy/zzz" -u "unsupported://target"
# ✓ slack://webhook/xxx/yyy/zzz
# ✗ unsupported://target: Unsupported notification protocol: unsupported:
```

The exit code is `0` when every URL is valid and `1` when any URL is invalid.

## Supported Providers

The CLI supports every provider exported by `statocysts`: Slack, Discord, Lark/Feishu, QQ Bot, Telegram, Bark, Server Chan, email, JSON endpoints, and logger.

Read the [provider reference](https://octoplorer.github.io/statocysts/providers/) for tested notification target formats and options.

> Notification targets often contain credentials. Prefer environment variables or another secret-injection mechanism instead of literal URLs in shell history.

## License

MIT
