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
stato -u <url> [-m <message> | -f <file>]
```

### Options

| Option      | Alias | Description                                                   |
| ----------- | ----- | ------------------------------------------------------------- |
| `--url`     | `-u`  | Notification service URL(s). Can be specified multiple times. |
| `--message` | `-m`  | Message content to send directly.                             |
| `--file`    | `-f`  | Read message content from a file.                             |
| `--help`    |       | Show help information.                                        |
| `--version` |       | Show version number.                                          |

### Message Priority

The message content is determined in the following order:

1. `--message` argument (highest priority)
2. `--file` argument
3. Standard input (stdin)

## Examples

### Send to a single URL

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -m "Hello World"
```

### Send to multiple URLs

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -u "json://example.com/api/notify" -m "Hello World"
```

### Read message from file

```bash
stato -u "slack://webhook/xxx/yyy/zzz" -f message.txt
```

### Read message from stdin

```bash
echo "Hello World" | stato -u "slack://webhook/xxx/yyy/zzz"
```

### Use with pipeline

```bash
cat deployment.log | stato -u "slack://webhook/xxx/yyy/zzz"
```

## Supported Services

This CLI supports all notification services provided by statocysts:

- **Slack**: `slack://webhook/xxx/yyy/zzz` or `slack://bot@channel:token`
- **JSON**: `json://example.com/api/endpoint`

For more details on URL formats, please refer to the [statocysts documentation](https://github.com/octoplorer/statocysts).

## License

MIT
