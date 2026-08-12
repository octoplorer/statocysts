---
title: Bark
description: Send Bark push notifications to one or more device keys.
---

Protocol: `bark:`  
Runtime: Node.js and browser

## Target format

```text
bark://<server>[:<port>]/<device-key>[/<device-key>...]
```

```ts
import { send } from 'statocysts'

await send(
  'bark://api.day.app/DEVICE_KEY',
  { title: 'Deployment complete', body: 'Production is healthy.' },
)
```

The provider sends an HTTPS request to `<server>/push`. Add more path segments to deliver one request to multiple device keys.

## Query parameters

Supported Bark fields are:

- `subtitle`, `group`, `url`, `icon`, `sound`, and `ciphertext`;
- `level`: `active`, `timeSensitive`, `passive`, or `critical`;
- `call=1`, `autoCopy=1`, and `isArchive=1`;
- `volume`, numeric `badge`, `copy`, and `action=none`.

```text
bark://api.day.app/DEVICE_KEY?group=operations&level=timeSensitive&sound=alarm
```

Query values are included in the JSON request body. Invalid enum/flag values reject delivery.

## Message format

With a body, the title is sent as `title` and the body as `markdown`. A title-only notification uses the title as `markdown`.

## Provider options

Direct `bark.send()` calls accept `fetchOptions`:

```ts
import { bark } from 'statocysts'

await bark.send(target, notification, {
  fetchOptions: { timeout: 5000 },
})
```
