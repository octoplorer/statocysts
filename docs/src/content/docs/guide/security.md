---
title: Security
sidebar:
  label: Security
  order: 6
description: Protect notification credentials across servers, browsers, CI, errors, and logs.
---

Notification targets frequently contain credentials in their username, password, path, or query string. Treat every complete target URL as a secret unless the provider explicitly documents otherwise.

## Keep targets on the server

Store privileged targets in environment variables or a managed secret store and read them only in trusted server-side code:

```ts
import { send } from 'statocysts'

const target = process.env.NOTIFICATION_TARGET

if (!target) {
  throw new Error('NOTIFICATION_TARGET is required')
}

await send(target, { title: 'Deployment complete' })
```

Do not commit targets to source control, put them in frontend environment variables, or include them in generated static files. Prefixes such as `PUBLIC_`, `NEXT_PUBLIC_`, and `VITE_` usually expose a value to the browser bundle.

:::danger
A secret injected during a frontend build is still public. Anyone who can load the application can inspect its JavaScript and network requests.
:::

Use a [server-side browser proxy](/statocysts/recipes/browser-proxy/) when client events must trigger privileged notifications.

## Avoid leaking targets

`NotificationDeliveryError.failures` contains normalized target URLs so that an application can identify failed destinations. Do not send complete failures to logs, telemetry, error trackers, or API responses.

Log a stable local label or protocol instead:

```ts
const targets = [
  { name: 'operations-slack', url: process.env.SLACK_TARGET! },
  { name: 'on-call-telegram', url: process.env.TELEGRAM_TARGET! },
]

const targetNames = new Map(
  targets.map(({ name, url }) => [new URL(url).toString(), name]),
)
```

After a delivery failure, use `targetNames.get(failure.target)` rather than logging `failure.target`. Review exception messages from HTTP clients before forwarding them because they may also include request URLs.

## Prefer encrypted transport

- Use `jsons:` for HTTPS JSON endpoints. Reserve `json:` for trusted local networks and development.
- Keep TLS enabled for SMTP and verify your mail server configuration.
- Do not replace provider API base URLs with unencrypted endpoints in production.
- Validate certificates normally; do not disable TLS verification to work around configuration errors.

Transport encryption protects a target in transit, but it does not make the target safe to expose in a browser or log.

## Limit credential impact

- Use a dedicated bot, webhook, or SMTP account for each environment.
- Grant only the scopes required to send notifications.
- Separate production targets from preview and development targets.
- Rotate credentials after accidental disclosure or when a collaborator no longer needs access.
- Revoke unused targets instead of leaving them dormant.

For CI, pass targets through the platform’s secret mechanism and give notification jobs the smallest possible token permissions. See the [GitHub Actions recipe](/statocysts/recipes/github-actions/).

## Validate untrusted input

Do not allow a browser or public API caller to submit an arbitrary notification target. Choose the target on the server from a fixed allowlist, authenticate the caller, rate-limit requests, and map allowed event names to server-owned notification text.

If user-provided text is included in a notification:

- enforce length limits;
- avoid placing secrets or personal data in notification bodies;
- consider provider formatting rules;
- reject unsupported event shapes before calling Statocysts.

## Respond to exposure

1. Revoke or rotate the affected provider credential.
2. Remove it from source, logs, artifacts, and error trackers where possible.
3. Replace the value in every deployment environment.
4. Review provider audit logs for unexpected deliveries.
5. Add a preventive control, such as secret scanning or structured redaction.

Removing a secret from the latest Git commit is not sufficient if it remains in history. Follow your hosting provider’s secret-removal procedure when repository history is affected.

## Production checklist

- [ ] Complete targets exist only in a secret store or server environment.
- [ ] Browser code never receives privileged targets.
- [ ] Logs use labels instead of target URLs.
- [ ] Production transports use TLS.
- [ ] Credentials are scoped and separated by environment.
- [ ] Public notification endpoints authenticate and rate-limit callers.
- [ ] Rotation and incident-response ownership are documented.
