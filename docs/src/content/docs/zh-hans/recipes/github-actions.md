---
title: GitHub Actions 通知
description: 从 GitHub Actions 发送部署结果，同时避免暴露通知目标。
---

使用仓库或环境密钥，避免完整通知目标出现在工作流源码中。

## 添加密钥

在仓库或部署环境中创建名为 `NOTIFICATION_TARGET` 的密钥。如果生产部署已经需要环境审批，请使用环境密钥。

## 在部署任务后发送通知

将通知任务加入现有工作流，并将 `deploy` 修改成部署任务的 ID：

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: ./scripts/deploy

  notify:
    needs: deploy
    if: ${{ !cancelled() }}
    runs-on: ubuntu-latest
    permissions: {}
    env:
      DEPLOY_RESULT: ${{ needs.deploy.result }}
      NOTIFICATION_TARGET: ${{ secrets.NOTIFICATION_TARGET }}
      REPOSITORY: ${{ github.repository }}
      REVISION: ${{ github.sha }}
    steps:
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          package-manager-cache: false

      - name: Send deployment notification
        continue-on-error: true
        shell: bash
        run: |
          workdir="$RUNNER_TEMP/statocysts-notify"
          mkdir -p "$workdir"
          cd "$workdir"
          npm init --yes >/dev/null
          npm install --no-audit --no-fund statocysts

          node --input-type=module <<'EOF'
          import { send } from 'statocysts'

          const target = process.env.NOTIFICATION_TARGET
          if (!target) {
            throw new Error('NOTIFICATION_TARGET is required')
          }

          const result = process.env.DEPLOY_RESULT ?? 'unknown'

          await send(target, {
            title: `Deployment ${result}`,
            body: [
              `Repository: ${process.env.REPOSITORY}`,
              `Revision: ${process.env.REVISION?.slice(0, 7)}`,
            ].join('\n'),
          })
          EOF
```

`!cancelled()` 会在成功或失败后运行任务，但会在工作流被取消时跳过。`permissions: {}` 可以防止通知任务获得不需要的仓库权限。

密钥通过环境传入，不会被插入脚本内容或命令行参数。GitHub 会在日志中遮盖已注册的密钥值，但脚本仍然不应打印通知目标或完整投递错误。

## 决定通知失败是否影响工作流

示例使用 `continue-on-error: true`，因此通知提供方故障不会改变部署结果。如果通知投递属于强制发布控制，请移除这个选项。

对于更严格的供应链策略，请将第三方和 GitHub 维护的 Action 固定到已审查的提交 SHA，而不是使用会移动的主版本标签。

## 通知多个目的地

将每个通知目标保存为独立密钥，并在内联模块中创建通知器：

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
])

await notifier.send({ title: '部署完成' })
```

除非同时定义并校验一种无歧义的序列化格式，否则不要把多个通知目标组合到一个密钥中。

参阅[安全](/statocysts/zh-hans/guide/security/)了解凭据处理，并参阅[多目标投递](/statocysts/zh-hans/recipes/multi-target-delivery/)处理部分失败。
