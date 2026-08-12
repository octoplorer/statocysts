---
title: Compatibility
sidebar:
  label: Compatibility
  order: 3
description: Compare runtime exports, browser constraints, credentials, and provider-specific options.
---

## Runtime requirements

| Runtime | Entry                | Requirement                                                      |
| ------- | -------------------- | ---------------------------------------------------------------- |
| Node.js | `statocysts`         | Node.js 24.12.0 or newer                                         |
| Browser | `statocysts/browser` | ES2020 and modern URL, Request, Headers, Fetch, and Promise APIs |

The browser entry excludes Email and Node.js SMTP code. A provider being exported from the browser entry means its implementation can run there; it does not guarantee that the remote API permits cross-origin requests or that exposing its credential is safe.

## Provider matrix

| Provider        | Protocol          | Node.js | Browser export | Direct browser guidance                                                                    |
| --------------- | ----------------- | :-----: | :------------: | ------------------------------------------------------------------------------------------ |
| Slack           | `slack:`          |    ✓    |       ✓        | Server recommended; targets contain webhook or bot credentials                             |
| Discord         | `discord:`        |    ✓    |       ✓        | Server recommended; targets contain webhook credentials                                    |
| Lark and Feishu | `lark:`           |    ✓    |       ✓        | Server recommended; targets may contain signing secrets                                    |
| QQ Bot          | `qqbot:`          |    ✓    |       ✓        | Server only in practice; targets contain an app secret                                     |
| Telegram        | `telegram:`       |    ✓    |       ✓        | Server recommended; targets contain a bot token                                            |
| Bark            | `bark:`           |    ✓    |       ✓        | Server recommended; device keys identify push recipients                                   |
| Server Chan     | `server-chan:`    |    ✓    |       ✓        | Server recommended; targets contain send keys                                              |
| Email           | `email:`          |    ✓    |       —        | Node.js only; requires SMTP APIs                                                           |
| JSON / JSONS    | `json:`, `jsons:` |    ✓    |       ✓        | Suitable only when the endpoint supports CORS and is designed for the client’s trust level |
| Logger          | `logger:`         |    ✓    |       ✓        | Suitable for local diagnostics; writes notification content to the console                 |

:::note
“Server recommended” is a security recommendation, not a bundling limitation. Check each provider’s CORS behavior separately because remote policies can change independently of Statocysts.
:::

## Browser decision guide

Use direct browser delivery only when all of these are true:

- the target contains no privileged or long-lived credential;
- the remote endpoint explicitly accepts your application origin;
- your Content Security Policy permits the connection;
- untrusted users are allowed to trigger that destination;
- provider rate limits and abuse controls are acceptable.

Otherwise use the [browser proxy recipe](/statocysts/recipes/browser-proxy/).

## Provider options

| Provider        | Direct-call options                                  |
| --------------- | ---------------------------------------------------- |
| Slack           | `fetchOptions`                                       |
| Discord         | `fetchOptions`                                       |
| Lark and Feishu | `fetchOptions`                                       |
| QQ Bot          | `apiBaseUrl`, `fetchOptions`                         |
| Telegram        | `apiBaseUrl`, `fetchOptions`                         |
| Bark            | `fetchOptions`                                       |
| Server Chan     | `fetchOptions`                                       |
| Email           | `defaultFrom`, `smtpConfig`                          |
| JSON / JSONS    | `FetchOptions` passed directly as the third argument |
| Logger          | None                                                 |

Top-level `send()` and `createNotifier()` intentionally expose one consistent runtime API and do not accept provider-specific options. Import a named provider when you need the options above.

## Capability notes

- All HTTP providers use the platform Fetch stack through `ofetch`.
- Email uses SMTP and is not included in `statocysts/browser`.
- JSON uses HTTP for `json:` and HTTPS for `jsons:`.
- Runtime multi-target delivery uses `Promise.allSettled()` and waits for every destination.
- Provider APIs and browser CORS policies can change without a Statocysts release.

For target formats and query parameters, open the corresponding page in the [provider reference](/statocysts/providers/).
