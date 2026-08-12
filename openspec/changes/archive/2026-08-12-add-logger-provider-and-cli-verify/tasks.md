## 1. Logger 提供方实现

- [x] 1.1 新增 `packages/statocysts/src/services/specialized/logger/`：实现本地传输（将 `{ level, title, body? }` 渲染为 `[statocysts] <title>` 与可选正文行并调用对应 `console` 方法）
- [x] 1.2 实现 `logger` 提供方：注册协议 `logger:`，解析 `level` 查询参数（`debug|info|warn|error`，默认 `info`，无效值抛错），复用 `defineProvider` 与共享通知校验
- [x] 1.3 编写 logger 单元测试：输出行格式、级别映射、默认级别、无效级别拒绝、无网络副作用、`send()` 解析为 `undefined`、空白标题拒绝

## 2. 目录注册

- [x] 2.1 在 `providers/browser.ts` 与 `providers/node.ts` 中加入 `logger` 命名导出
- [x] 2.2 更新 `providers/catalog.spec.ts`：在 `browserProviderNames` 与 `nodeProviderNames` 中追加 `'logger'`，保持命名导出与运行时注册一致性断言

## 3. CLI verify 子命令

- [x] 3.1 将 `packages/cli/src/index.ts` 的 yargs 配置重构为支持 `verify` 子命令（`-u/--url` 可多个），并保留 `argv._` 为空时的默认发送路径
- [x] 3.2 实现 verify 逻辑：对每个 URL 调用 `createNotifier([url])`，逐条输出 `✓ <url>` 或 `✗ <url>: <原因>`，全部有效退出码 `0`，任一无效退出码 `1`，缺少 URL 时报告参数错误
- [x] 3.3 为 CLI 添加验证测试（如必要时给 `@statocysts/cli` 增加 vitest 依赖）：覆盖默认发送行为不变、verify 有效 URL、verify 无效 URL 与退出码

## 4. 文档

- [x] 4.1 新增 `services/specialized/logger/README.md`：地址语法、`level` 参数、开发调试定位说明
- [x] 4.2 更新 `packages/cli/README.md`：补充 `stato verify` 用法与退出码约定
- [x] 4.3 在 `packages/statocysts/README.md` 中补充 logger 提供方示例

## 5. 验证

- [x] 5.1 运行 `pnpm test`、`pnpm typecheck` 与 `pnpm lint`，修复本变更引入的问题
- [x] 5.2 运行 `pnpm build` 并核对服务端与浏览器端产物的公开导出（新增 `logger`，无其它变化）
- [x] 5.3 运行 `openspec validate` 与变更校验，确认实现满足 `logger-provider` 与 `cli-verify` 的全部场景
