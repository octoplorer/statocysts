---
title: 邮件
description: 通过 SMTP 发送纯文本邮件通知。
---

协议：`email:`  
运行时：仅 Node.js

## 通知目标格式

```text
email://[<user>:<password>@]<host>[:<port>]/?to=<recipient>[&to=<recipient>...]
```

```ts
import { send } from 'statocysts'

await send(
  'email://smtp.example.com:587/?from=alerts@example.com&to=operator@example.com',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

默认端口是 587。用户名、密码和查询参数中的特殊字符必须进行 URL 编码。

## 查询参数

| 参数      | 描述                                                    |
| --------- | ------------------------------------------------------- |
| `to`      | 必填收件人，可重复指定。                                |
| `cc`      | 抄送收件人，可重复指定。                                |
| `bcc`     | 密送收件人，可重复指定。                                |
| `from`    | 发件人地址，默认依次使用 `defaultFrom` 和 SMTP 用户名。 |
| `subject` | 覆盖作为邮件主题的通知标题。                            |
| `ssl`     | `true` 启用 SSL，默认为 false。                         |
| `tls`     | 除 `false` 外的值都会启用 TLS；端口 587 默认启用。      |

## 提供方专属选项

```ts
import { email } from 'statocysts'

await email.send(
  'email://smtp.example.com/?to=operator@example.com',
  { title: 'SMTP test' },
  {
    defaultFrom: 'alerts@example.com',
    smtpConfig: { timeout: 10000 },
  },
)
```

`defaultFrom` 可以在通知目标之外提供发件人；`smtpConfig` 会将部分 EmailJS SMTP 连接选项合并到从 URL 派生的配置上。

## 限制

邮件通知仅支持纯文本，不支持附件或自定义消息头。

:::caution
请将 SMTP 凭据存放在密钥存储中，并优先使用应用专用密码和 TLS/SSL。
:::
