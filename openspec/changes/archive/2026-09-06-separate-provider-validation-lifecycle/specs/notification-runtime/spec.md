## ADDED Requirements

### Requirement: 提供方目标校验生命周期

每个内置通知提供方 SHALL 提供同步的 `validate(target, options?)` 操作。该操作 MUST 完成通用 URL、协议及提供方专属目标校验，合并本次调用使用的选项，并在成功时返回可复用的已校验目标绑定。校验过程 MUST NOT 构造或发送 transport payload、获取远程令牌、生成依赖发送时刻的签名或执行其他远程 I/O；已校验目标的投递操作 SHALL 在校验成功后才根据通知内容构造 transport payload。具体通知提供方的 `send()` SHALL 复用同一校验与投递生命周期。

#### Scenario: 独立校验有效目标

- **WHEN** 调用方对符合某个内置通知提供方格式的目标调用该提供方的 `validate()`
- **THEN** 系统同步返回已校验目标绑定，且不调用 transport 或远程服务

#### Scenario: 独立校验无效目标

- **WHEN** 调用方对缺少该提供方必填凭据、路径段或包含无效查询参数的目标调用 `validate()`
- **THEN** 系统同步报告对应的提供方校验错误，且不构造或发送 transport payload

#### Scenario: 校验时应用调用选项

- **WHEN** 某个目标是否合法取决于调用方选项，且调用方将这些选项传给 `validate()`
- **THEN** 系统在合并默认选项和调用选项后执行校验，并将合并结果保存在已校验目标绑定中

#### Scenario: 从已校验目标投递

- **WHEN** 调用方使用已校验目标绑定发送合法通知
- **THEN** 系统使用校验阶段得到的目标状态和选项构造一次 transport payload 并发起一次投递

#### Scenario: 直接提供方发送复用生命周期

- **WHEN** 调用方直接使用具体通知提供方的 `send()` 投递通知
- **THEN** 系统先执行与该提供方 `validate()` 相同的同步校验，再从已校验目标构造 payload 并投递，同时保留原始 provider 或 transport 错误

## MODIFIED Requirements

### Requirement: 通知器创建校验

`createNotifier()` SHALL 在创建时执行通用通知目标校验和对应通知提供方的专属目标校验，并缓存规范化目标、提供方和已校验目标绑定。系统 MUST 拒绝空目标列表、非字符串目标、无法解析的地址、不支持的协议、规范化后重复的目标，以及不符合提供方专属地址格式的目标。该阶段 MUST NOT 构造或发送 transport payload，也 MUST NOT 执行远程 I/O。

#### Scenario: 创建有效通知器

- **WHEN** 调用方提供一个或多个可解析、协议受支持、互不重复且符合各提供方专属格式的通知目标
- **THEN** 系统返回绑定这些规范化目标及其已校验提供方状态的通知器

#### Scenario: 拒绝空目标列表

- **WHEN** 调用方执行 `createNotifier([])`
- **THEN** 系统抛出 `TypeError`

#### Scenario: 拒绝无效地址

- **WHEN** 任一通知目标不是字符串或无法由标准 URL 解析器解析
- **THEN** 系统抛出 `TypeError` 且不创建通知器

#### Scenario: 拒绝不支持的协议

- **WHEN** 任一通知目标使用未注册协议
- **THEN** 系统抛出 `TypeError` 而不是静默过滤该目标

#### Scenario: 拒绝重复目标

- **WHEN** 两个通知目标经标准 URL 解析器规范化后相同
- **THEN** 系统抛出 `TypeError` 而不是自动去重或重复投递

#### Scenario: 延后提供方专属校验

- **WHEN** 通知目标可解析且协议受支持，但缺少对应通知提供方要求的凭据、路径段或包含无效查询参数
- **THEN** 系统不再将提供方专属校验延后到实际投递，而是在创建通知器时报告该提供方的校验错误，且不启动任何目标的投递

#### Scenario: 创建通知器不产生发送副作用

- **WHEN** 调用方使用包含远程认证或签名能力的合法目标创建通知器
- **THEN** 系统不获取远程令牌、不生成发送时签名、不构造 transport payload，也不调用 transport
