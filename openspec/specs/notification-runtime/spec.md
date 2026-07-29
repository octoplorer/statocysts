# Notification Runtime

## Purpose

定义 Statocysts 的统一通知模型、通知目标绑定、并行投递、失败语义及环境提供方目录。

## Requirements

### Requirement: 统一通知模型

系统 SHALL 将通知表示为包含字符串 `title` 和可选字符串 `body` 的对象。系统 MUST 在任何运行时投递开始前拒绝非对象通知、非字符串字段以及裁剪后为空的标题，并 MUST 保留合法通知字段的原始内容。

#### Scenario: 投递结构化通知

- **WHEN** 调用方使用合法通知目标和 `{ title: '告警', body: 'CPU 使用率超过 90%' }` 调用顶层 `send()`
- **THEN** 系统将未修改的通知交给对应通知提供方

#### Scenario: 拒绝空白标题

- **WHEN** 调用方投递标题只包含空白的通知
- **THEN** 系统在启动任何通知目标投递前抛出 `TypeError`

#### Scenario: 保留内容空白

- **WHEN** 合法标题或正文包含有意义的前导或尾随空白
- **THEN** 系统仅使用裁剪结果执行标题非空校验，并将原始内容交给通知提供方

#### Scenario: 直接提供方调用复用校验

- **WHEN** 调用方直接使用任一公开通知提供方投递无效通知
- **THEN** 该通知提供方在执行网络投递前抛出 `TypeError`

### Requirement: 通知运行时公开入口

包 SHALL 公开 `send(target, notification)` 和 `createNotifier(targets)`，并 SHALL 使用同一个通知运行时实现两者。通知目标 MUST 是字符串，成功投递 MUST 解析为 `undefined`。

#### Scenario: 单目标便捷投递

- **WHEN** 调用方使用受支持的通知目标字符串和合法通知调用顶层 `send()`
- **THEN** 系统通过该协议对应的通知提供方投递一次并解析为 `undefined`

#### Scenario: 拒绝 URL 对象目标

- **WHEN** JavaScript 调用方将 `URL` 对象而不是字符串作为通知目标传入运行时入口
- **THEN** 系统抛出 `TypeError`

#### Scenario: 旧发送器接口不可用

- **WHEN** 调用方检查包的公开导出
- **THEN** `createSender`、`senderRegistry` 和 `resolveProvider` 均不在公开接口中

### Requirement: 通知器创建校验

`createNotifier()` SHALL 在创建时执行通用通知目标校验并缓存规范化目标与对应通知提供方。系统 MUST 拒绝空目标列表、非字符串目标、无法解析的地址、不支持的协议以及规范化后重复的目标。

#### Scenario: 创建有效通知器

- **WHEN** 调用方提供一个或多个可解析且协议受支持的唯一通知目标
- **THEN** 系统返回绑定这些规范化目标及对应通知提供方的通知器

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

- **WHEN** 通知目标可解析且协议受支持，但不符合该通知提供方的专属地址格式
- **THEN** 通知器创建成功，并在实际投递时由通知提供方报告格式错误

### Requirement: 并行多目标投递

通知器 SHALL 同时启动全部通知目标的投递，MUST 等待全部投递完成，并 MUST NOT 保证完成顺序、自动重试或施加并发上限。

#### Scenario: 所有目标并行启动

- **WHEN** 通知器绑定多个通知目标并开始发送合法通知
- **THEN** 系统在等待任一目标完成前启动所有目标的投递

#### Scenario: 等待所有目标完成

- **WHEN** 部分通知目标提前失败或成功而其他目标仍在进行
- **THEN** 通知器保持未完成状态直到所有目标均已完成

#### Scenario: 不自动重试

- **WHEN** 某个通知目标投递失败
- **THEN** 系统只记录该次失败且不再次调用对应通知提供方

#### Scenario: 全部成功

- **WHEN** 所有通知目标投递成功
- **THEN** 通知器的 `send()` 解析为 `undefined`

### Requirement: 聚合投递错误

运行时投递存在任一失败时 SHALL 抛出公开的 `NotificationDeliveryError`。该错误 MUST 包含每个失败通知目标及其原始原因、成功数量和失败数量。顶层单目标 `send()` MUST 使用相同错误类型，直接通知提供方调用 MUST 保留原始错误。

#### Scenario: 部分目标失败

- **WHEN** 多目标通知器完成投递且至少一个目标失败、至少一个目标成功
- **THEN** 系统抛出 `NotificationDeliveryError`，其中失败明细和成功、失败数量与实际结果一致

#### Scenario: 所有目标失败

- **WHEN** 多目标通知器的全部目标均投递失败
- **THEN** 系统抛出包含全部目标原始失败原因的 `NotificationDeliveryError`

#### Scenario: 单目标运行时失败

- **WHEN** 顶层 `send()` 的唯一目标投递失败
- **THEN** 系统抛出失败数量为 1 的 `NotificationDeliveryError` 并保留原始原因

#### Scenario: 直接提供方失败

- **WHEN** 调用方直接调用具体通知提供方且投递失败
- **THEN** 该调用拒绝并返回通知提供方的原始错误，而不包装为 `NotificationDeliveryError`

### Requirement: 环境提供方目录

系统 SHALL 为服务端和浏览器端分别维护唯一的静态通知提供方目录。每个目录 MUST 同时作为对应运行时注册集合和顶层命名导出的来源，且其中每个协议 MUST 唯一。

#### Scenario: 浏览器目录一致

- **WHEN** 构建浏览器入口
- **THEN** 每个浏览器目录通知提供方都同时可被运行时解析并作为顶层名称导出，其中包括 `serverChan` 和 `jsons`

#### Scenario: 服务端目录一致

- **WHEN** 构建服务端入口
- **THEN** 每个服务端目录通知提供方都同时可被运行时解析并作为顶层名称导出，且服务端目录在浏览器目录基础上额外包含 `email`

#### Scenario: 拒绝重复协议

- **WHEN** 内部运行时使用包含重复协议的通知提供方集合构建
- **THEN** 构建立即失败而不是让后一个通知提供方静默覆盖前一个

### Requirement: 收缩公开扩展接口

包 SHALL 只公开通用通知入口、通知领域类型、`NotificationDeliveryError` 和内置通知提供方，不再公开内部注册与传输构建能力，也不支持调用方向内置运行时注册自定义通知提供方。

#### Scenario: 核心内部能力不再导出

- **WHEN** 调用方检查包的公开导出和类型声明
- **THEN** `defineProvider`、`defineTransport`、`buildSenderRegistry`、内置传输对象及其内部类型均不可从包入口导入

#### Scenario: 内置通知提供方保持命名导出

- **WHEN** 调用方从对应环境入口导入任一内置通知提供方
- **THEN** 该通知提供方仍可通过顶层命名导出直接调用并传入专属选项
