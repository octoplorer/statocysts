# CLI Verify

## Purpose

定义 `@statocysts/cli` 的 `verify` 子命令参数、校验语义、输出格式与退出码，以及默认发送行为的保持要求。

## Requirements

### Requirement: verify 子命令

CLI SHALL 提供 `verify` 子命令，接受一个或多个 `-u/--url` 参数，对每个通知目标执行与运行时 `createNotifier()` 一致的校验（字符串可解析、协议已注册、标准化后不重复），并逐个输出校验结果。

#### Scenario: 校验有效 URL

- **WHEN** 用户执行 `stato verify -u "slack://webhook/a/b/c"`
- **THEN** CLI 输出该 URL 有效的指示并最终以退出码 `0` 结束

#### Scenario: 校验多个 URL

- **WHEN** 用户为 `verify` 提供多个 `-u` 参数
- **THEN** CLI 逐个输出每个 URL 的校验结果

#### Scenario: 报告无效 URL

- **WHEN** 任一 URL 不可解析或使用未注册协议
- **THEN** CLI 输出该 URL 无效的指示及其原因，并最终以非零退出码结束

#### Scenario: 校验语义与运行时一致

- **WHEN** 用户校验一个运行时 `createNotifier()` 会拒绝的目标
- **THEN** `verify` 将该目标报告为无效，且不发起任何通知发送

#### Scenario: 缺少 URL 参数

- **WHEN** 用户执行 `stato verify` 而未提供任何 `-u` 参数
- **THEN** CLI 报告参数错误并以非零退出码结束

### Requirement: 默认发送行为保持

未提供任何子命令时，CLI SHALL 保持现有发送行为：`stato -u <url> -t <title>` 发送通知，全部目标成功时输出成功提示并以退出码 `0` 结束，发生投递失败时输出逐目标失败明细并以非零退出码结束。

#### Scenario: 无子命令时发送

- **WHEN** 用户执行 `stato -u "slack://webhook/a/b/c" -t "Alert"`（不带子命令）
- **THEN** CLI 按现有行为发送通知并输出成功提示

#### Scenario: 发送失败报告

- **WHEN** 通知投递部分或全部失败
- **THEN** CLI 输出每个失败目标及其原因并以非零退出码结束
