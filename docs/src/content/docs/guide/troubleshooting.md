---
title: Troubleshooting
sidebar:
  label: Troubleshooting
  order: 7
description: Diagnose target setup, provider validation, transport, timeout, and browser failures.
---

Start by identifying whether the failure happens while creating a notifier or while delivering a notification. The boundary determines which error shape to inspect.

## Classify the failure

| When it fails                                                          | Typical cause                                                                         | Error shape                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------ |
| `createNotifier()` returns                                             | Empty list, malformed/duplicate target, unsupported protocol, invalid provider format | Synchronous target/provider error    |
| Top-level `send()` rejects before delivery                             | The same local target/provider validation errors as `createNotifier()`                | Original target/provider error       |
| Top-level `send()` or notifier `.send()` rejects after delivery starts | Request preparation or transport failure                                              | `NotificationDeliveryError`          |
| Named provider `validate()` throws                                     | Malformed target or invalid provider format                                           | Original target/provider error       |
| Named provider `.send()` rejects                                       | Provider validation, preparation, or transport failure                                | Original provider or transport error |

A named provider call is useful for isolating one integration because it preserves the original error:

```ts
import { slack } from 'statocysts'

await slack.send(process.env.SLACK_TARGET!, {
  title: 'Diagnostic notification',
})
```

:::caution
Run diagnostics against a dedicated test destination. A request can succeed even if your application later loses the response, so repeated tests may create duplicate notifications.
:::

## Target setup errors

Check these conditions first:

1. The target is a complete URL, not just a provider token.
2. Its protocol matches a built-in provider, including the trailing colon after parsing.
3. Every target in `createNotifier()` is unique after URL normalization.
4. At least one target is supplied.
5. Provider-required credentials, path segments, and query values are present and locally valid.

Use the CLI for local runtime and provider validation without contacting the provider:

```sh
stato verify -u "$NOTIFICATION_TARGET"
```

`verify` validates the provider-specific shape and required presence of path segments, credentials, and recipients. It does not prove those values exist remotely or test connectivity.

## Inspect batch failures safely

```ts
import { NotificationDeliveryError, send } from 'statocysts'

try {
  await send(process.env.NOTIFICATION_TARGET!, {
    title: 'Diagnostic notification',
  })
}
catch (error) {
  if (!(error instanceof NotificationDeliveryError)) {
    throw error
  }

  console.error({
    successCount: error.successCount,
    failureCount: error.failureCount,
    causes: error.failures.map(({ cause }) =>
      cause instanceof Error ? cause.name : typeof cause),
  })
}
```

Avoid logging `failure.target`. It can contain webhook tokens, bot credentials, device keys, or SMTP passwords. Inspect detailed causes only in a controlled environment and review them before sending them to telemetry.

## Provider URL validation

If runtime validation fails, compare the target with its provider reference page. Local validation catches common issues such as:

- missing webhook path segments;
- credentials placed in the wrong URL component;
- an unsupported hostname such as a wrong bot target type;
- invalid query values or provider formatting modes;
- URL-sensitive characters that were not percent-encoded.

Use `encodeURIComponent()` for individual dynamic URL components before constructing a target. Do not encode the complete URL at once.

## HTTP failures and timeouts

HTTP providers accept `fetchOptions`. A direct provider call can set a bounded timeout:

```ts
import { telegram } from 'statocysts'

await telegram.send(
  process.env.TELEGRAM_TARGET!,
  { title: 'Diagnostic notification' },
  { fetchOptions: { timeout: 5000 } },
)
```

When a request fails, check:

- DNS and outbound network access;
- proxy or firewall rules;
- provider API availability and rate limits;
- HTTP status and response body in a controlled environment;
- system time when the provider signs requests;
- whether the credential was revoked or rotated.

Do not add automatic retries until you understand whether the provider operation is idempotent. A timeout can occur after the provider accepted the notification.

## Browser and CORS failures

A provider appearing in `statocysts/browser` does not guarantee its API accepts requests from your origin. In browser developer tools, check for:

- a failed CORS preflight;
- a blocked request with no compatible `Access-Control-Allow-Origin` response;
- mixed content caused by an HTTP endpoint on an HTTPS page;
- Content Security Policy restrictions;
- browser extensions or privacy tools blocking the request.

Do not use a public CORS proxy or expose a credential to bypass CORS. Move privileged delivery to your backend using the [browser proxy recipe](/statocysts/recipes/browser-proxy/).

## Email failures

Email is available only from the Node.js entry. Verify:

- Node.js satisfies the supported version in the [compatibility reference](/statocysts/reference/compatibility/);
- the SMTP host and port are reachable;
- `from` and at least one `to` address are present;
- TLS settings match the server and port;
- authentication is required only when both username and password are configured.

## A repeatable diagnostic sequence

1. Reproduce with one target and a dedicated test recipient.
2. Run `stato verify` to isolate local runtime and provider URL errors.
3. Call the named provider directly to expose the original cause.
4. Add a finite timeout and inspect the provider response locally.
5. Compare the target shape with the provider reference.
6. Check credentials, rate limits, CORS, DNS, firewall, and service status.
7. Remove temporary diagnostics and rotate any credential exposed during testing.

If several targets are involved, reintroduce them only after the single-target call succeeds. See [multi-target delivery](/statocysts/recipes/multi-target-delivery/) for failure-aware retry behavior.
