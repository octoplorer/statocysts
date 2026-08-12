---
title: CLI 参考
description: 使用 stato 发送通知和校验通知目标。
---

## 安装

```sh
pnpm add --global @statocysts/cli
```

## 发送通知

```text
stato -u <target> -t <title> [-b <body> | -f <file>]
```

```sh
stato \
  -u "slack://webhook/T00000000/B00000000/WEBHOOK_TOKEN" \
  -t "Deployment complete" \
  -b "Version 0.14.0 is now live."
```

重复使用 `--url` 可以向多个通知目标发送：

```sh
stato \
  -u "$SLACK_TARGET" \
  -u "$TELEGRAM_TARGET" \
  -t "Service recovered"
```

## 通知正文的读取优先级

CLI 按顺序使用第一个可用来源：

1. `--body` 或 `-b`；
2. `--file` 或 `-f` 指定的文件；
3. 标准输入。

```sh
echo "CPU usage exceeded 90%" | stato -u "$TARGET" -t "High CPU usage"
```

## 校验通知目标

```text
stato verify -u <target> [-u <target> ...]
```

`verify` 会确认每个值都是使用已注册协议的合法 URL。它不会访问远程服务，也不会校验提供方专属凭据或 URL 组件。

```sh
stato verify -u "$SLACK_TARGET" -u "$TELEGRAM_TARGET"
```

全部目标通过通知运行时校验时，命令以 `0` 退出；任一目标失败时以 `1` 退出。

## 选项

| 选项        | 别名 | 描述                   |
| ----------- | ---- | ---------------------- |
| `--url`     | `-u` | 通知目标，可重复指定。 |
| `--title`   | `-t` | 发送时必填的通知标题。 |
| `--body`    | `-b` | 通知正文。             |
| `--file`    | `-f` | 从文件读取正文。       |
| `--help`    |      | 显示命令帮助。         |
| `--version` |      | 显示 CLI 版本。        |

:::caution
在命令行中直接传递的通知目标可能暴露在 Shell 历史记录和进程列表中。对于包含凭据的目标，请优先使用环境变量或其他密钥注入机制。
:::
