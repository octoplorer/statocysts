# Logger Provider

## Purpose

定义 `logger:` 协议通知提供方的地址语法、控制台输出行为与双端目录注册要求，用于开发与调试场景。

## Requirements

### Requirement: Logger 提供方注册与地址语法

系统 SHALL 提供名为 `logger` 的通知提供方，注册协议 `logger:`。该提供方 MUST 同时出现在浏览器端与服务端提供方目录中，并 MUST 通过两个入口的顶层命名导出暴露。合法地址为 `logger://`，可通过查询参数 `level` 选择输出级别。

#### Scenario: 目录注册与命名导出

- **WHEN** 调用方检查浏览器端与服务端提供方目录及顶层命名导出
- **THEN** 两个目录均包含 `logger`，且命名导出与运行时注册的 `logger:` 协议一致

#### Scenario: 默认地址有效

- **WHEN** 调用方使用 `logger://` 作为通知目标
- **THEN** 系统接受该目标并在发送时输出通知内容

#### Scenario: 指定输出级别

- **WHEN** 地址包含 `level=warn` 查询参数
- **THEN** 系统使用 `console.warn` 输出通知内容

#### Scenario: 拒绝无效级别

- **WHEN** 地址的 `level` 查询参数不是 `debug`、`info`、`warn` 或 `error` 之一
- **THEN** 系统在发送时抛出错误且不输出任何内容

### Requirement: Logger 输出行为

Logger 提供方 SHALL 将通知标题输出为一行 `[statocysts] <title>`，并在存在正文时于下一行输出正文。输出级别 MUST 映射到对应的 `console` 方法（`debug`→`console.debug`、`info`→`console.info`、`warn`→`console.warn`、`error`→`console.error`），未指定时 MUST 使用 `console.info`。

#### Scenario: 仅标题

- **WHEN** 通知只有标题且无正文
- **THEN** 系统只输出一行 `[statocysts] <title>`

#### Scenario: 标题与正文

- **WHEN** 通知同时包含标题与正文
- **THEN** 系统在第一行输出 `[statocysts] <title>`，并在第二行输出正文

#### Scenario: 默认使用 info 级别

- **WHEN** 地址未指定 `level` 参数
- **THEN** 系统使用 `console.info` 输出

### Requirement: Logger 发送语义

Logger 提供方的 `send()` SHALL 在完成输出后解析为 `undefined`，MUST NOT 发起任何网络请求，并 MUST 复用与其它提供方一致的共享通知校验（拒绝空白标题等无效通知）。

#### Scenario: 发送成功

- **WHEN** 调用方通过 logger 提供方发送合法通知
- **THEN** 输出完成且 `send()` 解析为 `undefined`

#### Scenario: 无网络副作用

- **WHEN** 调用方发送通知到 logger 提供方
- **THEN** 系统不发起任何 HTTP 或其它网络请求

#### Scenario: 复用通知校验

- **WHEN** 调用方向 logger 提供方投递标题只包含空白的通知
- **THEN** 系统在输出任何内容前抛出 `TypeError`
