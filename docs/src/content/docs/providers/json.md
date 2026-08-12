---
title: JSON endpoints
description: POST notifications to generic HTTP and HTTPS JSON endpoints.
---

Protocols: `json:` and `jsons:`  
Runtime: Node.js and browser

## Target format

```text
json://<host>[:<port>]/<path>
jsons://<host>[:<port>]/<path>
```

`json:` sends HTTP; `jsons:` sends HTTPS.

```ts
import { send } from 'statocysts'

await send('jsons://example.com/notifications', {
  title: 'Deployment complete',
  body: 'Production is healthy.',
})
```

The default body is:

```json
{
  "title": "Deployment complete",
  "body": "Production is healthy."
}
```

`body` is omitted when the notification has no body.

## Add headers and body fields

A query key whose decoded value starts with a space becomes a request header. A key starting with `:` becomes an additional body property.

```text
jsons://example.com/notifications?%20Authorization=Bearer%20TOKEN&:environment=production
```

This sends `Authorization: Bearer TOKEN` and adds `"environment": "production"` to the JSON body. Other query parameters remain in the endpoint URL.

:::tip
In form-style query strings, `+Authorization` also decodes to a leading-space header key.
:::

## Provider options

`json.send()` and `jsons.send()` accept `ofetch` `FetchOptions` directly:

```ts
import { jsons } from 'statocysts'

await jsons.send(target, notification, {
  timeout: 5000,
  retry: 2,
})
```
