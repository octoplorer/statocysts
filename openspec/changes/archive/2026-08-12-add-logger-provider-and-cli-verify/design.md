## Context

`statocysts` 目前只有网络类通知提供方（HTTP/SMTP 传输）。开发与调试时缺少一个不产生网络副作用、直接观察通知内容的通道；CLI 也没有发送前的 URL 校验能力，用户把拼错的 URL 交给 `stato` 时只能在真实发送失败后看到错误。

运行时已经通过 `createNotifier()` 提供了完整的通用校验：目标必须是可解析字符串、协议必须已注册、目标不得重复。CLI 与提供方目录是唯一需要改动的地方。

## Goals / Non-Goals

**Goals:**

- 新增 `logger:` 提供方，把通知标题与正文输出到控制台，服务端与浏览器端行为一致。
- CLI 新增 `verify` 子命令，复用运行时既有校验语义，逐个报告目标有效性并以退出码反映结果。
- 保持 CLI 现有 `stato -u ... -t ...` 默认发送行为不变。
- 不新增包的公开导出或运行时依赖。

**Non-Goals:**

- 不提供可配置的自定义日志输出函数（如注入 `log` 回调），保持提供方无状态、可序列化。
- 不新增 `STATOCYSTS_URL` 等环境变量支持。
- 不提供 URL 生成器（`generate`）或提供方专属语法深度校验。
- 不改变任何现有提供方的协议地址语法、请求行为或专属选项。

## Decisions

### 1. Logger 使用自定义传输而非 HTTP 传输

`logger` 不发送网络请求，因此不复用 `http` 传输，而是定义本地传输实现：`prepare()` 返回一个结构化的输出描述（如 `{ level, lines }`），传输直接调用对应 `console` 方法。这符合现有 `defineProvider`/`defineTransport` 的契约，`transport.send` 的 payload 类型无需扩展。

选择本地传输而不是特判 `prepare` 后直接在提供方内输出，是为了让 logger 与其它提供方保持相同的「渲染与发送分离」结构，测试可以直接断言传输收到的 payload。

### 2. 输出级别通过查询参数选择，默认 info

地址语法为 `logger://`，可选查询参数 `level=debug|info|warn|error`（默认 `info`），映射到 `console.debug/info/warn/error`。输出格式为：一行 `[statocysts] <title>`，如有正文则另起一行输出 `<body>`，无额外前缀或时间戳。

选择查询参数而不是提供方选项（options），是为了与其它提供方保持一致：地址自身携带全部配置，`send(target, notification)` 无需第三个参数即可完整表达；同时让 CLI 拼 URL 的用户也能使用级别控制。

### 3. Logger 同时进入浏览器与服务端目录

`logger` 只依赖各环境普遍存在的 `console`，因此同时加入 `providers/browser.ts` 与 `providers/node.ts` 两个目录，成为 `browserProviderNames` 与 `nodeProviderNames` 的公共成员。目录测试只需在两个预期列表中追加 `'logger'`，不需要其它结构性改动。

### 4. verify 复用 `createNotifier()`，不新增公开 API

CLI `verify` 对每个 URL 调用 `createNotifier([url])`：成功即视为有效；抛出 `TypeError` 时报告其 message 作为原因。这样校验语义与运行时发送路径完全一致（可解析性、协议注册、规范化），且不重新暴露此前已从公开面移除的解析接口。

选择复用而不是新增 `verifyTarget()` 公开函数，是因为 `createNotifier()` 的既有校验已经覆盖 verify 的全部需求，避免为 CLI 维护独立的公开 API 表面。

### 5. CLI 使用 yargs 子命令并保留默认发送路径

yargs 配置新增 `.command('verify', ...)` 子命令。当 `argv._` 为空（即用户未输入任何子命令）时执行现有发送逻辑，保持 `stato -u ... -t ...` 的向后兼容；`stato verify -u ...` 进入校验路径。verify 接受一个或多个 `-u/--url`，逐条输出 `✓ <url>`（有效）或 `✗ <url>: <原因>`（无效），全部有效退出码为 `0`，存在任一无效退出码为 `1`。

选择保留默认发送路径而不是强制子命令（`demandCommand`），是因为现有用户脚本与文档都直接使用扁平参数形式，强制迁移没有收益。

## Risks / Trade-offs

- [yargs 子命令与现有扁平参数共存时解析行为不一致] → verify 与发送路径共享同一 `--url` 参数定义；通过 e2e 风格测试（真实调用 `run()`）验证 `stato -u ... -t ...` 行为不变。
- [`console.debug` 在部分浏览器/Node 配置下被静默抑制] → 默认级别为 `info`，只有用户显式传 `level=debug` 才使用 `console.debug`；文档注明。
- [用户误把 logger 用于生产环境导致通知无人接收] → 文档将 logger 定位为开发与调试用途；不提供持久化或远程投递能力。
- [目录测试断言集合变更遗漏] → 同步更新 `catalog.spec.ts` 的两个预期列表，并保持测试对「命名导出与运行时注册一致」的既有断言。
