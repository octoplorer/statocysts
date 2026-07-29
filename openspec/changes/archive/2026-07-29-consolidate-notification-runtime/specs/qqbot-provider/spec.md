## MODIFIED Requirements

### Requirement: QQ Bot Provider 注册

系统 SHALL 以 `qqbot:` 协议将 QQ 机器人通知提供方纳入服务端与浏览器端的内置提供方目录，并 SHALL 通过两个环境入口顶层命名导出 `qqbot`。QQ 机器人通知提供方 SHALL 遵循统一通知模型和具体提供方接口。

#### Scenario: Provider 在通知运行时中可用

- **WHEN** 用户通过 `createNotifier` 或顶层 `send` 使用 `qqbot:` 协议的通知目标
- **THEN** 通知运行时找到并调用 QQ 机器人通知提供方处理该目标

#### Scenario: Provider 可直接调用

- **WHEN** 用户从服务端或浏览器端入口导入 `qqbot`
- **THEN** 用户可以直接投递结构化通知并传入 QQ 机器人专属选项

### Requirement: 浏览器环境可用

系统 SHALL 在浏览器内置提供方目录中包含 QQ 机器人通知提供方，因为其运行时依赖在浏览器环境中可用。

#### Scenario: 浏览器入口导出并注册 qqbot

- **WHEN** 从 `statocysts/browser` 导入
- **THEN** `qqbot` 作为顶层命名导出可用，且浏览器通知运行时能识别 `qqbot:` 协议
