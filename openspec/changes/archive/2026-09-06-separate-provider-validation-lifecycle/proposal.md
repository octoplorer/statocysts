## Why

`defineProvider` 当前把通知目标校验与 transport payload 构造都放在 `prepare()` 中，导致校验只能在实际发送时发生。CLI `verify` 因而只能确认 URL 可解析且协议已注册，无法发现缺失凭据、路径格式或查询参数错误等 provider 专属问题。

## What Changes

- 为每个内置 provider 引入同步的 `validate(target, options?)` 目标校验生命周期；校验成功返回可复用的已校验目标绑定，且不构造或发送 transport payload。
- 调整 `defineProvider` 的内部契约，将目标解析与校验结果传递给后续准备阶段，避免 `prepare()` 同时承担合法性判断与发送参数构造。
- 迁移所有内置 provider，把主机名、凭据、路径及查询参数校验从 `prepare()` 移入新的校验阶段；网络请求、令牌获取、签名和 transport payload 构造仍只在发送阶段执行。
- 让运行时在 `createNotifier()` 绑定目标时完成 provider 校验并缓存已校验的目标绑定，实际发送时直接从已校验状态构造 payload。
- 让 CLI `verify` 在不发送通知、也不访问远端服务的前提下报告 provider 专属目标错误。
- **BREAKING**：`createNotifier()` 将在创建阶段拒绝 provider 专属格式无效的目标，而不再把这些错误延后到首次发送。

## Capabilities

### New Capabilities

<!-- 无新增 capability。 -->

### Modified Capabilities

- `notification-runtime`: 通知器创建校验扩展为 provider 专属校验，并在投递前使用已校验的目标绑定。
- `cli-verify`: `verify` 扩展为检查 provider 专属地址格式、凭据和查询参数，同时保持无网络副作用。

## Impact

- `packages/statocysts/src/core/provider.ts` 与 `packages/statocysts/src/core/runtime.ts` 的 provider 对象、已校验目标绑定及运行时契约和类型；不新增包级校验入口或自定义 provider 注册接口。
- 所有 `packages/statocysts/src/services/**` 内置 provider 的校验与 payload 准备逻辑及其测试。
- `packages/cli/src/index.ts` 的 verify 行为、测试和相关中英文文档。
- `createNotifier()` 的失败时机发生变化；顶层导出、provider 协议格式及成功发送产生的 transport payload 保持不变。
- 不新增运行时依赖，不进行远程凭据真实性或服务连通性检查。
