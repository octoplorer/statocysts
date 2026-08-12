---
title: GitHub Actions notifications
description: Send a deployment result from GitHub Actions without exposing the notification target.
---

Use a repository or environment secret so the complete notification target never appears in workflow source.

## Add the secret

Create a secret named `NOTIFICATION_TARGET` in the repository or deployment environment. Use an environment secret when production deployments already require environment approval.

## Notify after a deployment job

Add a notification job to an existing workflow and change `deploy` to the ID of your deployment job:

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

`!cancelled()` runs the job after success or failure but skips it when the workflow is cancelled. `permissions: {}` prevents the notification job from receiving repository permissions it does not need.

The secret is passed through the environment rather than interpolated into the script or command-line arguments. GitHub masks registered secret values in logs, but your script should still avoid printing the target or complete delivery errors.

## Decide whether notification failure is fatal

The example uses `continue-on-error: true` so a provider outage does not change the deployment result. Remove it when notification delivery is a required release control.

For stricter supply-chain policies, pin third-party and GitHub-maintained actions to reviewed commit SHAs instead of moving major-version tags.

## Notify several destinations

Store each target as a separate secret and create a notifier in the inline module:

```ts
import { createNotifier } from 'statocysts'

const notifier = createNotifier([
  process.env.SLACK_TARGET!,
  process.env.TELEGRAM_TARGET!,
])

await notifier.send({ title: 'Deployment complete' })
```

Do not combine several targets into one secret unless you also define and validate an unambiguous serialization format.

Read [Security](/statocysts/guide/security/) for credential handling and [multi-target delivery](/statocysts/recipes/multi-target-delivery/) for partial failures.
