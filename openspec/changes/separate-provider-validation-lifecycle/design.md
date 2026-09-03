## Context

`defineProvider()` 目前只返回 `protocol` 与 `send()`；`send()` 在创建含 URL 和通知的 context 后直接调用 `prepare()`。因此每个 provider 的 URL 断言、查询参数解析、远程认证、签名和 transport payload 构造都处在同一个异步阶段。

运行时的 `createNotifier()` 是同步 API，只规范化 URL、检查重复目标并按协议绑定 provider。CLI `verify` 对单个 URL 调用该 API，所以其校验边界同样停在 provider 之前。现有所有 provider 专属格式校验都是同步且只依赖 URL 与 provider options；QQ Bot 令牌获取和 Lark 签名等异步或时变操作属于发送准备，不应进入校验。

`defineProvider`、运行时 provider 接口和 transport 构造能力不是包级公开扩展 API，但具体内置 provider 是命名导出并支持直接 `send()`。通知器可被反复使用，因此校验结果也需要可复用。参见 `proposal.md` 与本变更的 `notification-runtime`、`cli-verify` delta specs。

## Goals / Non-Goals

**Goals:**

- 用类型明确区分同步、无副作用的目标校验与可异步、有发送副作用的 payload 准备。
- 让一次成功校验产生可供多次通知投递复用的目标状态，避免运行时在每次发送前重复解析和校验。
- 让运行时创建、CLI verify 和具体 provider 直接发送共享同一套 provider 校验规则与错误信息。
- 保持现有协议语法、provider options 合并规则、通知内容映射、transport payload 和投递错误聚合语义。

**Non-Goals:**

- 不验证 token、webhook 或收件人是否真实有效，也不探测远程服务连通性。
- 不把 provider 构建、注册或 transport API 重新导出为公共扩展面。
- 不把 `createNotifier()` 或 CLI verify 改为异步 API。
- 不借此变更收紧既有 provider URL 规则；只迁移当前已有的本地合法性判断以及 payload 构造必需的本地解析。

## Decisions

### 1. `validate()` 同步返回已校验目标绑定

`NotificationProvider` 增加 `validate(target, options?)`。它依次解析 URL、检查协议、合并默认与调用方 options，并执行 `defineProvider` 配置中的同步校验函数。成功后返回一个已校验目标绑定，绑定持有规范化 URL、合并后的 options、provider 专属校验结果，以及 `send(notification)`。

生命周期为：

```text
target + options
      │
      ▼
provider.validate() ──失败──▶ 本地校验错误（无 transport / 网络副作用）
      │
      ▼
ValidatedTarget
      │ send(notification)
      ▼
通知校验 → prepare(validated state + message) → transport.send(payload)
```

已校验目标的 `send()` 每次仍校验通知对象，然后调用 `prepare()` 并交给 transport。具体 provider 现有的 `send(target, notification, options?)` 保持兼容，但实现改为先调用自身 `validate()`，再调用返回绑定的 `send()`。

选择返回绑定而不是让 `validate()` 只返回 `void`，是为了让 `createNotifier()` 缓存解析结果并保证实际投递确实从已校验状态开始；否则运行时必须在发送时重新校验，两个阶段仍可能漂移。没有选择异步校验，是因为现有本地规则不需要异步，而且异步会破坏 `createNotifier()` 的同步失败语义。

### 2. 校验 hook 产生类型化 provider 状态，`prepare()` 只消费状态

`DefineProviderOptions` 增加一个代表 provider 专属已校验状态的泛型。新的同步 `validate(context, options)` hook 只接收 URL context 与合并后的 options，并返回该状态；`prepare()` 接收包含 URL、通知和已校验状态的 context，再返回 transport payload。没有专属规则的 provider 可省略 hook，其状态为 `undefined`。

各 provider 应把后续构造真正需要的解析结果一起返回，而不是只执行断言后让 `prepare()` 重复解析：

| Provider                 | 校验阶段状态                                                  | 保留在准备阶段的工作                      |
| ------------------------ | ------------------------------------------------------------- | ----------------------------------------- |
| Slack、Discord、Telegram | endpoint 类型、凭据/目标、已解析 query                        | 组合消息正文并创建 HTTP request           |
| Lark                     | webhook token、secret、domain/base URL                        | 按发送时刻生成签名并创建 request          |
| QQ Bot                   | chat 类型、app 凭据、OpenID、回复参数                         | 获取/复用远程 access token 并创建 request |
| Bark、Server Chan        | server/version、device/send key、已解析 query                 | 组合消息正文并创建 request                |
| Email                    | SMTP 地址与认证、收件人、已解析 query、合并后的 sender/config | 组合通知主题和正文并创建 SMTP payload     |
| Logger                   | 已解析 level                                                  | 创建日志 transport payload                |
| JSON/JSONS               | 无额外合法性状态                                              | 映射 URL、header、body 与通知内容         |

这使校验 hook 保持纯本地且与通知内容无关。`prepare()` 中不再保留同一目标规则的断言或 schema 校验；发送时的远程失败仍作为 transport/provider 原始错误处理。

另一方案是让 `validate()` 直接构造 `Request` 或 SMTP payload 并缓存，但 payload 包含通知内容，而且签名、token 和某些请求数据必须在发送时生成；提前构造会让 verify 产生副作用或让可复用通知器发送过期数据，因此不采用。

### 3. 运行时缓存已校验绑定

运行时内部 provider 契约从“按 target 直接发送”调整为“按 target 创建已校验绑定”。`createNotifier()` 仍先完成字符串、URL、重复目标和协议目录检查，然后调用对应 provider 的 `validate()`，并把返回绑定与规范化 target 一起存入 `BoundTarget`。通知器发送时对所有绑定调用 `send(notification)`，现有 `Promise.allSettled`、并行启动和 `NotificationDeliveryError` 聚合逻辑保持不变。

provider 校验失败仍在 `createNotifier()` 调用栈中原样抛出；它不是一次投递失败，所以不包装为 `NotificationDeliveryError`。顶层 `send(target, notification)` 通过 `createNotifier([target])` 自然获得相同的新失败时机。

运行时构造时会校验 provider 同时具有合法 `protocol`、`validate` 与直接发送能力。现有运行时单元测试中的假 provider 改为返回可控的已校验绑定；provider catalog 测试改用每种协议的最小合法 fixture，不能再用 `${protocol}//target` 假设任意已注册协议都接受同一种格式。

### 4. CLI 继续复用 `createNotifier()`，不引入第二套规则

CLI `verify` 的控制流无需增加 provider 注册表或新包级 API：它继续逐个调用 `createNotifier([url])` 并报告成功或异常 message。运行时的新绑定流程会自动执行 provider 专属校验，而不会调用绑定的 `send()`。

CLI 测试增加“可解析且协议受支持、但 provider 格式无效”的失败用例，以及 QQ Bot 等 provider 的 transport/远程认证未被调用的用例。中英文 CLI、错误处理和 troubleshooting 文档删除“不会校验 provider 专属组件”的旧说明，改为明确只执行本地格式校验、不验证远端真实性。

选择继续复用 `createNotifier()` 而不是新增 `verifyTarget()`，是为了让 CLI 与运行时不产生新的语义分叉，也避免扩大包级 API。逐 URL 调用方式保留现有逐项输出行为。

## Risks / Trade-offs

- [原先在首次发送时出现的 provider 格式错误会提前到通知器创建时] → 在 proposal 标记 breaking behavior，更新运行时、CLI 和错误处理文档，并以迁移测试锁定新时机。
- [校验 hook 中残留令牌获取、签名、Request 构造或 transport 调用会让 verify 产生副作用] → 为 core 生命周期和有异步副作用的 provider 增加 spy 测试，要求仅已校验绑定的 `send()` 可触发这些操作。
- [provider 校验与准备仍各自解析同一字段会重新引入漂移] → 使用泛型校验状态把解析结果显式传给 `prepare()`，并在 provider 迁移审查中移除重复断言/schema parse。
- [缓存 options 或目标状态后，调用方继续修改原对象可能造成行为不稳定] → 校验时生成合并后的 options 快照并让 provider 状态只包含解析后的值；provider 实现不得依赖校验后对原 options 的修改。
- [同步校验无法支持必须访问远端的真实性检查] → 这是刻意边界；远程认证和连通性仍属于发送，未来若需要 online verify 应设计独立的异步能力。
- [目录一致性测试原有的合成 target 在严格校验后失效] → 为每个 provider 维护最小合法目标 fixture，同时继续验证目录与命名导出一致。

## Migration Plan

1. 先扩展 core provider 类型和测试，建立 `validate()`、已校验目标绑定、直接 `send()` 委托以及无副作用约束。
2. 逐个迁移内置 provider，将已有断言/schema parsing 移入校验 hook，并验证成功发送生成的 payload 与现状一致。
3. 调整运行时为创建时绑定已校验目标，更新失败时机、并行投递、错误聚合和目录一致性测试。
4. 扩充 CLI verify 测试并更新中英文文档，确认 provider 专属错误可见且无远程副作用。
5. 运行 workspace 类型检查、单元测试、构建和 OpenSpec 严格校验。

该变更没有持久化数据迁移。若需要回滚，可整体恢复旧 provider/runtime 契约与文档；协议 URL 和 transport payload 未变化，不需要用户转换已有目标配置。
