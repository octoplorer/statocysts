---
title: CLI reference
description: Send and verify notification targets with stato.
---

## Install

```sh
pnpm add --global @statocysts/cli
```

## Send a notification

```text
stato -u <target> -t <title> [-b <body> | -f <file>]
```

```sh
stato \
  -u "slack://webhook/T00000000/B00000000/WEBHOOK_TOKEN" \
  -t "Deployment complete" \
  -b "Version 0.14.0 is now live."
```

Repeat `--url` to send to multiple targets:

```sh
stato \
  -u "$SLACK_TARGET" \
  -u "$TELEGRAM_TARGET" \
  -t "Service recovered"
```

## Body input precedence

The CLI reads the body from the first available source:

1. `--body` or `-b`;
2. the file passed to `--file` or `-f`;
3. standard input.

```sh
echo "CPU usage exceeded 90%" | stato -u "$TARGET" -t "High CPU usage"
```

## Verify targets

```text
stato verify -u <target> [-u <target> ...]
```

`verify` confirms that each value is a valid URL using a registered protocol and satisfies the provider's local rules for required credentials, path segments, and query values. It does not send a notification or contact the remote service, so it cannot confirm that credentials or recipients exist or that the service is reachable.

```sh
stato verify -u "$SLACK_TARGET" -u "$TELEGRAM_TARGET"
```

The command exits with `0` when every target passes local runtime and provider validation and `1` when any target fails.

## Options

| Option      | Alias | Description                                       |
| ----------- | ----- | ------------------------------------------------- |
| `--url`     | `-u`  | Notification target. Repeat for multiple targets. |
| `--title`   | `-t`  | Required notification title when sending.         |
| `--body`    | `-b`  | Notification body.                                |
| `--file`    | `-f`  | Read the body from a file.                        |
| `--help`    |       | Show command help.                                |
| `--version` |       | Show the CLI version.                             |

:::caution
Shell history and process listings can expose target URLs passed directly on the command line. Prefer environment variables or another secret-injection mechanism for targets containing credentials.
:::
