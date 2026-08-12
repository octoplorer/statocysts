## URL Scheme Format

Writes notifications to the console for development and debugging purposes. Performs no network requests.

```
logger://[?level=<debug|info|warn|error>]
```

### Query Parameters

- `level`: Optional. Output level, defaults to `info`. Maps to the matching `console` method:
  - `debug` → `console.debug`
  - `info` → `console.info`
  - `warn` → `console.warn`
  - `error` → `console.error`

### Output Format

The title is printed as a single line prefixed with `[statocysts]`; the body (if present) is printed on the following line.

```
[statocysts] Hello, world!
Optional body details
```

### Examples

Basic output to the console:

```
logger://
```

Output as a warning:

```
logger://?level=warn
```

> [!NOTE]
> The logger provider is intended for development and debugging. It does not persist or deliver notifications anywhere, so it should not be used as the sole target in production.
