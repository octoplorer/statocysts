# Email Provider

Email provider for Statocysts, enabling email notifications via SMTP protocol.

## Features

- Send emails through any SMTP server
- Support for multiple recipients (to, cc, bcc)
- SMTP authentication (username/password)
- SSL/TLS support
- Configurable sender and subject
- Plain text email support

## URL Format

```
email://[username[:password]@]host[:port]/?from=sender@example.com&to=recipient@example.com[&to=...][&cc=...][&bcc=...]
```

## Parameters

### Required Parameters

- `host`: SMTP server hostname
- `to`: Recipient email address (supports multiple `to` parameters)

### Optional Parameters

- `username`: SMTP authentication username (from URL auth part)
- `password`: SMTP authentication password (from URL auth part)
- `port`: SMTP server port (default: `587`)
- `from`: Sender email address (default: username or `defaultFrom` option)
- `cc`: CC (carbon copy) recipient (supports multiple `cc` parameters)
- `bcc`: BCC (blind carbon copy) recipient (supports multiple `bcc` parameters)
- `subject`: Custom email subject (default: message title)
- `ssl`: Enable SSL connection (default: `false`)
- `tls`: Enable TLS/STARTTLS (default: `true` for port 587)

## Usage Examples

### Basic Example

```typescript
import { send } from 'statocysts'

await send(
  'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com',
  'Email Title',
  'Email body content'
)
```

### With SMTP Authentication

```typescript
await send(
  'email://username:password@smtp.example.com/?from=sender@example.com&to=recipient@example.com',
  'Authenticated Email',
  'This email requires SMTP auth'
)
```

### Multiple Recipients

```typescript
await send(
  'email://smtp.example.com/?from=sender@example.com&to=user1@example.com&to=user2@example.com&to=user3@example.com',
  'Newsletter',
  'Sent to multiple recipients'
)
```

### With CC and BCC

```typescript
await send(
  'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com&cc=cc1@example.com&cc=cc2@example.com&bcc=bcc@example.com',
  'Email with copies',
  'Primary recipient gets this, with CC and BCC'
)
```

### Custom Subject

```typescript
await send(
  'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com&subject=Important+Alert',
  'Default Title', // This will be ignored
  'The subject is overridden by query parameter'
)
```

### Using Default From Option

```typescript
import { email } from 'statocysts'

await email.send(
  'email://smtp.example.com/?to=recipient@example.com',
  { title: 'Test Email' },
  { defaultFrom: 'noreply@example.com' }
)
```

## Common SMTP Server Configurations

### Gmail

```typescript
// Port 587 with TLS (recommended)
await send(
  'email://username:app-password@smtp.gmail.com:587/?from=username@gmail.com&to=recipient@example.com',
  'Gmail Test',
  'Sent via Gmail SMTP'
)

// Port 465 with SSL
await send(
  'email://username:app-password@smtp.gmail.com:465/?from=username@gmail.com&to=recipient@example.com&ssl=true&tls=false',
  'Gmail SSL Test'
)
```

**Note**: Gmail requires [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password.

### Outlook/Office 365

```typescript
await send(
  'email://username:password@smtp.office365.com:587/?from=username@outlook.com&to=recipient@example.com',
  'Outlook Test',
  'Sent via Outlook SMTP'
)
```

### Custom SMTP Server

```typescript
// Standard port 25 (no encryption)
await send(
  'email://smtp.mycompany.com:25/?from=sender@mycompany.com&to=recipient@example.com&tls=false',
  'Internal Email'
)

// Port 587 with STARTTLS (recommended)
await send(
  'email://user:pass@smtp.mycompany.com:587/?from=sender@mycompany.com&to=recipient@example.com',
  'Secure Email'
)

// Port 465 with SSL/TLS
await send(
  'email://user:pass@smtp.mycompany.com:465/?from=sender@mycompany.com&to=recipient@example.com&ssl=true&tls=false',
  'SSL Email'
)
```

## Port Reference

| Port | Protocol | Usage                                     |
| ---- | -------- | ----------------------------------------- |
| 25   | SMTP     | Standard, often blocked by ISPs           |
| 465  | SMTPS    | SMTP over SSL (legacy, still widely used) |
| 587  | SMTP     | SMTP with STARTTLS (recommended)          |
| 2525 | SMTP     | Alternative port (same as 587)            |

## Error Handling

### Missing Required Parameters

```typescript
// Error: SMTP host is required
await send('email://?to=recipient@example.com', 'Test')

// Error: At least one recipient email address (to) is required
await send('email://smtp.example.com/?from=sender@example.com', 'Test')

// Error: Sender email address (from) is required
await send('email://smtp.example.com/?to=recipient@example.com', 'Test')
```

### Invalid Email Format

```typescript
// Error: Invalid email query parameters
await send(
  'email://smtp.example.com/?from=invalid-email&to=recipient@example.com',
  'Test'
)
```

## Advanced Options

### Custom SMTP Configuration

```typescript
import { email } from 'statocysts'

await email.send(
  'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com',
  { title: 'Test' },
  {
    smtpConfig: {
      timeout: 10000, // Connection timeout in ms
      authentication: ['PLAIN', 'LOGIN'], // Allowed auth methods
    }
  }
)
```

### URL Encoding

For special characters in username or password, use URL encoding:

```typescript
// Password: p@ss word
// Encoded:  p%40ss%20word
await send(
  'email://user%40domain:p%40ss%20word@smtp.example.com/?from=sender@example.com&to=recipient@example.com',
  'Encoded Auth Test'
)
```

## TypeScript

```typescript
import type { EmailOptions } from 'statocysts'
import { email } from 'statocysts'

const options: EmailOptions = {
  defaultFrom: 'noreply@example.com',
  smtpConfig: {
    timeout: 5000,
  }
}

await email.send(
  'email://smtp.example.com/?to=recipient@example.com',
  { title: 'Typed Email', body: 'With TypeScript support' },
  options
)
```

## Message Format

- **Title only**: The title becomes both the subject and the body
- **Title + Body**: The title is the subject, body is formatted as:

  ```
  Title

  Body content
  ```

## Limitations

- Only plain text emails are supported (no HTML)
- No attachment support
- No custom headers support
- Email body is always sent as UTF-8 plain text

## Security Considerations

1. **Never hardcode credentials**: Use environment variables or secure configuration
2. **Use App Passwords**: For Gmail and similar services, use app-specific passwords
3. **Prefer TLS/SSL**: Always use encrypted connections (port 587 or 465)
4. **URL Encode Passwords**: Properly encode special characters in passwords
5. **Avoid Port 25**: Often blocked by ISPs to prevent spam

## Related

- [SMTP Transport](../../../core/transports/smtp.ts)
- [emailjs Documentation](https://github.com/eleith/emailjs)
