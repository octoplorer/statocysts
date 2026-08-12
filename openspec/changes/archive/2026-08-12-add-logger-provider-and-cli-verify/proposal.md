## Why

对比 shoutrrr，本项目缺少两个低成本的实用能力：一个把通知写到控制台/日志的 `logger` 提供方（用于开发调试与本地验证），以及 CLI 的 `verify` 子命令（在真正发送前校验 URL 是否可解析、协议是否受支持，避免把无效目标直接用于发送导致告警丢失）。

## What Changes

- 新增 `logger` 通知提供方，注册协议 `logger:`，将通知的标题与正文按行输出到控制台，服务端与浏览器端均可使用；支持通过查询参数选择输出级别。
- 将 `logger` 纳入服务端与浏览器端提供方目录、顶层命名导出与目录测试。
- CLI 新增 `verify` 子命令，对一个或多个通知目标执行与运行时一致的解析与协议校验，逐个输出校验结果，并在存在无效目标时以非零状态退出。
- CLI 保持现有 `stato -u ... -t ...` 默认发送行为不变（无子命令时仍为发送），避免破坏现有用法。
- 不公开新的运行时解析接口：`verify` 复用 `createNotifier()` 的既有校验语义，包的公开导出保持不变。

## Capabilities

### New Capabilities

- `logger-provider`: 定义 `logger:` 协议提供方的地址语法、输出行为与目录注册要求。
- `cli-verify`: 定义 CLI `verify` 子命令的参数、校验语义、输出格式与退出码。

### Modified Capabilities

<!-- 无：notification-runtime 的既有 requirement 不变，logger 只是新增一个提供方，verify 复用既有校验语义。 -->

## Impact

- `packages/statocysts/src/services/specialized/logger/`：新增 logger 提供方实现与测试。
- `packages/statocysts/src/providers/browser.ts` 与 `providers/node.ts`：目录加入 `logger` 导出。
- `packages/statocysts/src/providers/catalog.spec.ts`：更新两个环境的预期提供方集合。
- `packages/cli/src/index.ts`：将 yargs 配置改为支持 `verify` 子命令并保留默认发送行为，新增校验输出与退出码处理。
- `packages/cli/README.md` 与 `packages/statocysts/README.md`：补充 logger 用法与 `verify` 命令文档。
- 不新增运行时依赖，不改变任何现有通知提供方的协议地址格式或行为。
