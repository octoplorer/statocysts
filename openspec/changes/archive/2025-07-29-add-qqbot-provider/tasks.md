## 1. 创建模块文件

- [x] 1.1 创建 `packages/statocysts/src/services/chat/qqbot/index.ts` 实现 qqbot provider
  - 定义 `QQBotOptions` 接口（`apiBaseUrl`、`fetchOptions`）
  - 实现 `getAccessToken` 函数：POST `/app/getAppAccessToken`，模块级 `Map` 缓存，过期前 60s 刷新
  - 实现 `prepare` 函数：解析 URL（AppID、ClientSecret、hostname、openid）、获取 token、构建 Request
  - 仅 title → `msg_type=0, content`；title+body → `msg_type=2, markdown.content`
  - 从 URL query 提取 `msg_id`/`msg_seq`/`event_id` 放入请求体
  - hostname 为 `user` → `/v2/users/{openid}/messages`，`group` → `/v2/groups/{openid}/messages`

## 2. 编写测试

- [x] 2.1 创建 `packages/statocysts/src/services/chat/qqbot/index.spec.ts`
  - Mock `http` transport 和 `ofetch`（用于 token 获取）
  - 测试单聊纯文本消息发送
  - 测试单聊 Markdown 消息发送
  - 测试群聊消息发送
  - 测试无效 hostname 抛出错误
  - 测试缺少 AppID/ClientSecret 抛出错误
  - 测试 `msg_id`/`msg_seq` 查询参数
  - 测试 token 缓存命中（不重复请求）
  - 测试 token 过期前刷新
  - 测试 `apiBaseUrl` 选项覆盖
  - 测试 `fetchOptions` 透传

## 3. 注册 Provider

- [x] 3.1 在 `packages/statocysts/src/index.ts` 中导入并注册 `qqbot`
- [x] 3.2 在 `packages/statocysts/src/browser.ts` 中导入并注册 `qqbot`
- [x] 3.3 在 `packages/statocysts/src/index.ts` 的 export 中添加 `qqbot`

## 4. 验证

- [x] 4.1 运行 `pnpm test` 确保所有测试通过
- [x] 4.2 运行 `pnpm lint` 确保代码风格一致
- [x] 4.3 运行 `pnpm build` 确保构建成功
