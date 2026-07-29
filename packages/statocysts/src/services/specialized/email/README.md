# Email Provider

Email provider for Statocysts, enabling email notifications through SMTP.

## URL Format

```text
email://[username[:password]@]host[:port]/?from=sender@example.com&to=recipient@example.com[&to=...][&cc=...][&bcc=...]
```

## Parameters

### Required

- `host`: SMTP server hostname
- `to`: Recipient email address; repeat the parameter for multiple recipients

### Optional

- `username` and `password`: SMTP authentication credentials
- `port`: SMTP server port, defaulting to `587`
- `from`: Sender address, defaulting to the username or `defaultFrom`
- `cc` and `bcc`: Additional recipients; both support repeated parameters
- `subject`: Subject override, defaulting to the notification title
- `ssl`: Enable SSL, defaulting to `false`
- `tls`: Enable TLS/STARTTLS, defaulting to `true` on port 587

## Basic Usage

```typescript
import { send } from 'statocysts'

await send(
  'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com',
  {
    title: 'Email Title',
    body: 'Email body content',
  },
)
```

## Authentication and Recipients

```typescript
await send(
  'email://username:password@smtp.example.com:587/?from=sender@example.com&to=user1@example.com&to=user2@example.com&cc=copy@example.com',
  {
    title: 'Newsletter',
    body: 'Sent to multiple recipients',
  },
)
```

## Provider-Specific Options

Use the named provider when SMTP defaults must be configured outside the target URL.

```typescript
import { email } from 'statocysts'

await email.send(
  'email://smtp.example.com/?to=recipient@example.com',
  { title: 'Test Email' },
  {
    defaultFrom: 'noreply@example.com',
    smtpConfig: {
      timeout: 10000,
      authentication: ['PLAIN', 'LOGIN'],
    },
  },
)
```

## Common Server Configurations

### Gmail with STARTTLS

```typescript
await send(
  'email://username:app-password@smtp.gmail.com:587/?from=username@gmail.com&to=recipient@example.com',
  { title: 'Gmail Test', body: 'Sent through Gmail SMTP' },
)
```

Gmail requires [App Passwords](https://support.google.com/accounts/answer/185833) instead of the account password.

### Office 365

```typescript
await send(
  'email://username:password@smtp.office365.com:587/?from=username@outlook.com&to=recipient@example.com',
  { title: 'Outlook Test', body: 'Sent through Outlook SMTP' },
)
```

### Custom SMTP Server

```typescript
await send(
  'email://smtp.mycompany.com:465/?from=sender@mycompany.com&to=recipient@example.com&ssl=true&tls=false',
  { title: 'SSL Email' },
)
```

## Port Reference

| Port | Protocol | Usage                           |
| ---- | -------- | ------------------------------- |
| 25   | SMTP     | Standard, often blocked by ISPs |
| 465  | SMTPS    | SMTP over SSL                   |
| 587  | SMTP     | SMTP with STARTTLS              |
| 2525 | SMTP     | Common alternative to 587       |

## Error Handling

Provider-specific target validation happens when delivery starts.

```typescript
await send(
  'email://smtp.example.com/?to=recipient@example.com',
  { title: 'Test' },
)
```

The example fails because no sender address can be resolved. Top-level `send()` wraps delivery failures in `NotificationDeliveryError`; direct `email.send()` preserves the original provider error.

## Message Format

- With a title only, the title becomes both subject and text.
- With a body, the title becomes the subject and the text contains the title followed by the body.

## Limitations

- Plain text only
- No attachments
- No custom headers

## Security

1. Keep credentials out of source code.
2. Prefer TLS or SSL.
3. URL-encode special characters in credentials.
4. Prefer provider-specific application passwords where available.
