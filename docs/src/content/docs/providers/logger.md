---
title: Logger
description: Print notifications to the console for development and debugging.
---

Protocol: `logger:`  
Runtime: Node.js and browser

The logger provider performs no network request.

## Target format

```text
logger://[?level=<debug|info|warn|error>]
```

```ts
import { send } from 'statocysts'

await send('logger://?level=warn', {
  title: 'Queue delayed',
  body: 'The oldest job is five minutes old.',
})
```

`level` defaults to `info` and selects the matching `console` method.

## Output

```text
[statocysts] Queue delayed
The oldest job is five minutes old.
```

The title is prefixed with `[statocysts]`; the optional body appears on the next line.

:::note
Use logger to test runtime wiring and notification formatting. It does not persist or deliver anything, so it should not be the only production target.
:::

The logger provider has no provider-specific options.
