---
title: 故障排查
sidebar:
  label: 故障排查
  order: 7
description: 排查通知目标设置、提供方校验、传输、超时和浏览器问题。
---

首先确认问题发生在创建通知器时，还是投递通知时。这个边界决定了应该检查哪一种错误结构。

## 判断失败类型

| 失败时机                                | 常见原因                                 | 错误结构                    |
| --------------------------------------- | ---------------------------------------- | --------------------------- |
| `createNotifier()` 返回时               | 列表为空、URL 错误、目标重复、协议不支持 | 同步 `TypeError`            |
| 顶层 `send()` 或通知器 `.send()` 拒绝时 | 提供方校验或传输失败                     | `NotificationDeliveryError` |
| 具名提供方 `.send()` 拒绝时             | 提供方校验或传输失败                     | 原始提供方或传输错误        |

具名通知提供方调用会保留原始错误，因此适合隔离单个集成：

```ts
import { slack } from 'statocysts'

await slack.send(process.env.SLACK_TARGET!, {
  title: '诊断通知',
})
```

:::caution
请使用专用测试目的地进行诊断。即使应用随后未收到响应，请求也可能已经成功，因此重复测试可能产生重复通知。
:::

## 通知目标设置错误

请先检查以下条件：

1. 通知目标是完整 URL，而不只是通知提供方令牌。
2. 协议与内置通知提供方匹配，并且解析后包含末尾冒号。
3. `createNotifier()` 中的每个目标在 URL 规范化后仍然唯一。
4. 至少提供了一个通知目标。

可以使用 CLI 执行不会联系远程提供方的运行时级校验：

```sh
stato verify -u "$NOTIFICATION_TARGET"
```

`verify` 不会校验通知提供方特定的路径段、凭据、接收者或远程连接。

## 安全地检查批量失败

```ts
import { NotificationDeliveryError, send } from 'statocysts'

try {
  await send(process.env.NOTIFICATION_TARGET!, {
    title: '诊断通知',
  })
}
catch (error) {
  if (!(error instanceof NotificationDeliveryError)) {
    throw error
  }

  console.error({
    successCount: error.successCount,
    failureCount: error.failureCount,
    causes: error.failures.map(({ cause }) =>
      cause instanceof Error ? cause.name : typeof cause),
  })
}
```

不要记录 `failure.target`，它可能包含 Webhook 令牌、机器人凭据、设备密钥或 SMTP 密码。只在受控环境中检查详细原因，并在发送到遥测服务前进行审查。

## 通知提供方 URL 校验

如果运行时校验通过，但投递立即失败，请将通知目标与对应提供方参考页面进行比较。常见问题包括：

- 缺少 Webhook 路径段；
- 凭据放在错误的 URL 组成部分中；
- 使用了错误的机器人目标类型等不受支持的主机名；
- 查询值或通知提供方格式化模式无效；
- URL 敏感字符没有进行百分号编码。

请对单个动态 URL 组成部分使用 `encodeURIComponent()`，不要一次编码完整 URL。

## HTTP 失败和超时

HTTP 通知提供方接受 `fetchOptions`。具名通知提供方调用可以设置有限超时：

```ts
import { telegram } from 'statocysts'

await telegram.send(
  process.env.TELEGRAM_TARGET!,
  { title: '诊断通知' },
  { fetchOptions: { timeout: 5000 } },
)
```

请求失败时请检查：

- DNS 和出站网络权限；
- 代理或防火墙规则；
- 通知提供方 API 可用性和频率限制；
- 受控环境中的 HTTP 状态和响应正文；
- 使用请求签名的通知提供方所依赖的系统时间；
- 凭据是否已撤销或轮换。

在理解提供方操作是否幂等之前，不要添加自动重试。超时可能发生在提供方已经接受通知之后。

## 浏览器和 CORS 失败

某个通知提供方出现在 `statocysts/browser` 中，并不保证其 API 接受来自当前源的请求。请在浏览器开发者工具中检查：

- CORS 预检失败；
- 响应没有兼容的 `Access-Control-Allow-Origin`，导致请求被阻止；
- HTTPS 页面调用 HTTP 端点产生混合内容；
- 内容安全策略限制；
- 浏览器扩展或隐私工具阻止请求。

不要通过公开 CORS 代理或暴露凭据来绕过 CORS。请使用[浏览器代理配方](/statocysts/zh-hans/recipes/browser-proxy/)将特权投递移到后端。

## 邮件失败

邮件只存在于 Node.js 入口。请确认：

- Node.js 满足[兼容性参考](/statocysts/zh-hans/reference/compatibility/)中的版本要求；
- SMTP 主机和端口可以访问；
- 存在 `from` 和至少一个 `to` 地址；
- TLS 设置与服务器和端口匹配；
- 只有同时配置用户名和密码时才要求认证。

## 可重复的诊断顺序

1. 使用单个通知目标和专用测试接收者复现。
2. 运行 `stato verify` 隔离运行时级 URL 错误。
3. 直接调用具名通知提供方以获得原始错误。
4. 添加有限超时，并在本地检查通知提供方响应。
5. 将通知目标格式与提供方参考进行比较。
6. 检查凭据、频率限制、CORS、DNS、防火墙和服务状态。
7. 删除临时诊断信息，并轮换测试过程中暴露的凭据。

如果问题涉及多个通知目标，请先让单目标调用成功，再逐个加入其他目标。参阅[多目标投递](/statocysts/zh-hans/recipes/multi-target-delivery/)了解能感知部分失败的重试方式。
