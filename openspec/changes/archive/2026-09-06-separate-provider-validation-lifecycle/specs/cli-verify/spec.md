## MODIFIED Requirements

### Requirement: verify 子命令

CLI SHALL 提供 `verify` 子命令，接受一个或多个 `-u/--url` 参数，对每个通知目标执行与运行时 `createNotifier()` 一致的通用校验和提供方专属目标校验，并逐个输出校验结果。校验 MUST NOT 发送通知、调用 transport、获取远程令牌或访问远程服务。

#### Scenario: 校验有效 URL

- **WHEN** 用户执行 `stato verify -u "slack://webhook/a/b/c"`
- **THEN** CLI 输出该 URL 有效的指示并最终以退出码 `0` 结束

#### Scenario: 校验多个 URL

- **WHEN** 用户为 `verify` 提供多个 `-u` 参数
- **THEN** CLI 逐个输出每个 URL 的校验结果

#### Scenario: 报告无效 URL

- **WHEN** 任一 URL 不可解析或使用未注册协议
- **THEN** CLI 输出该 URL 无效的指示及其原因，并最终以非零退出码结束

#### Scenario: 报告提供方专属无效 URL

- **WHEN** URL 可解析且协议已注册，但缺少对应提供方要求的凭据、路径段或包含无效查询参数
- **THEN** CLI 输出该 URL 无效的指示及对应提供方的原因，并最终以非零退出码结束

#### Scenario: 校验语义与运行时一致

- **WHEN** 用户校验一个运行时 `createNotifier()` 会因通用或提供方专属规则而拒绝的目标
- **THEN** `verify` 将该目标报告为无效

#### Scenario: 校验无发送副作用

- **WHEN** 用户校验需要远程认证、签名或网络 transport 才能发送的合法目标
- **THEN** CLI 只执行本地目标校验，不获取远程令牌、不生成发送时签名且不访问远程服务

#### Scenario: 缺少 URL 参数

- **WHEN** 用户执行 `stato verify` 而未提供任何 `-u` 参数
- **THEN** CLI 报告参数错误并以非零退出码结束
