import type { SMTPServerSession } from 'smtp-server'
import { SMTPServer } from 'smtp-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { email } from '#/index'

describe('email integration test', () => {
  let server: SMTPServer
  let receivedMails: Array<{ from: string, to: string[], data: string }> = []
  const SMTP_PORT = 2526 // Different port from unit tests

  beforeAll(async () => {
    // Create a test SMTP server with authentication support
    server = new SMTPServer({
      authOptional: true,
      disabledCommands: ['STARTTLS'],
      onAuth(auth, _session, callback) {
        // Simple auth: accept any username/password for testing
        // In real scenarios, you would validate credentials here
        if (auth.username && auth.password) {
          callback(null, { user: auth.username })
        }
        else {
          callback(new Error('Invalid credentials'))
        }
      },
      onData(stream, session: SMTPServerSession, callback) {
        let data = ''
        stream.on('data', (chunk) => {
          data += chunk
        })
        stream.on('end', () => {
          receivedMails.push({
            from: session.envelope.mailFrom !== false ? session.envelope.mailFrom.address : '',
            to: session.envelope.rcptTo.map(addr => addr.address),
            data,
          })
          callback()
        })
      },
    })

    await new Promise<void>((resolve, reject) => {
      server.listen(SMTP_PORT, (err?: Error) => {
        if (err)
          reject(err)
        else resolve()
      })
    })
  })

  beforeEach(() => {
    receivedMails = []
  })

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve())
    })
  })

  it('should send basic email through local SMTP server', async () => {
    await email.send(
      `email://localhost:${SMTP_PORT}/?from=sender@example.com&to=recipient@example.com`,
      { title: 'Test Email' },
    )

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].from).toBe('sender@example.com')
    expect(receivedMails[0].to).toContain('recipient@example.com')
    // Subject may be encoded (e.g., =?UTF-8?Q?Test_Email?=)
    expect(receivedMails[0].data).toMatch(/Subject:.*Test.*Email/)
    expect(receivedMails[0].data).toContain('Test Email')
  })

  it('should send email with body content', async () => {
    await email.send(
      `email://localhost:${SMTP_PORT}/?from=sender@example.com&to=recipient@example.com`,
      {
        title: 'Important Alert',
        body: 'This is the email body content with important information.',
      },
    )

    expect(receivedMails).toHaveLength(1)
    // Subject may be encoded
    expect(receivedMails[0].data).toMatch(/Subject:.*Important.*Alert/)
    expect(receivedMails[0].data).toContain('Important Alert')
    expect(receivedMails[0].data).toContain('This is the email body content with important information.')
  })

  it('should send email to multiple recipients', async () => {
    await email.send(
      `email://localhost:${SMTP_PORT}/?from=sender@example.com&to=user1@example.com&to=user2@example.com&to=user3@example.com`,
      { title: 'Multi-recipient Test' },
    )

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].to).toHaveLength(3)
    expect(receivedMails[0].to).toContain('user1@example.com')
    expect(receivedMails[0].to).toContain('user2@example.com')
    expect(receivedMails[0].to).toContain('user3@example.com')
  })

  it('should send email with CC and BCC', async () => {
    await email.send(
      `email://localhost:${SMTP_PORT}/?from=sender@example.com&to=primary@example.com&cc=cc1@example.com&cc=cc2@example.com&bcc=bcc@example.com`,
      { title: 'Email with CC and BCC' },
    )

    expect(receivedMails).toHaveLength(1)
    // All recipients (to, cc, bcc) are in the envelope
    expect(receivedMails[0].to).toHaveLength(4)
    expect(receivedMails[0].to).toContain('primary@example.com')
    expect(receivedMails[0].to).toContain('cc1@example.com')
    expect(receivedMails[0].to).toContain('cc2@example.com')
    expect(receivedMails[0].to).toContain('bcc@example.com')
    // CC should appear in headers
    expect(receivedMails[0].data).toMatch(/Cc:.*cc1@example\.com.*cc2@example\.com/)
    // BCC should NOT appear in headers (that's the point of BCC)
    expect(receivedMails[0].data).not.toMatch(/Bcc:/)
  })

  it('should send email with custom subject', async () => {
    await email.send(
      `email://localhost:${SMTP_PORT}/?from=sender@example.com&to=recipient@example.com&subject=Custom+Subject+Line`,
      { title: 'Default Title' },
    )

    expect(receivedMails).toHaveLength(1)
    // Subject may be encoded
    expect(receivedMails[0].data).toMatch(/Subject:.*Custom.*Subject.*Line/)
    expect(receivedMails[0].data).not.toMatch(/Subject:.*Default.*Title/)
  })

  it('should use defaultFrom option', async () => {
    await email.send(
      `email://localhost:${SMTP_PORT}/?to=recipient@example.com`,
      { title: 'Test with Default From' },
      { defaultFrom: 'default@example.com' },
    )

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].from).toBe('default@example.com')
  })

  it('should send email with SMTP authentication', async () => {
    await email.send(
      `email://testuser:testpass@localhost:${SMTP_PORT}/?from=sender@example.com&to=recipient@example.com&tls=false`,
      { title: 'Auth Test' },
    )

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].from).toBe('sender@example.com')
  })

  it('should handle URL encoded credentials', async () => {
    await email.send(
      `email://user%40domain:pass%20word@localhost:${SMTP_PORT}/?from=sender@example.com&to=recipient@example.com&tls=false`,
      { title: 'Encoded Credentials Test' },
    )

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].from).toBe('sender@example.com')
  })

  it('should throw error when host is missing', async () => {
    await expect(
      email.send(
        `email://?from=sender@example.com&to=recipient@example.com`,
        { title: 'Test' },
      ),
    ).rejects.toThrow('SMTP host is required')
  })

  it('should throw error when to is missing', async () => {
    await expect(
      email.send(
        `email://localhost:${SMTP_PORT}/?from=sender@example.com`,
        { title: 'Test' },
      ),
    ).rejects.toThrow('At least one recipient email address (to) is required')
  })

  it('should throw error when from is missing and no default', async () => {
    await expect(
      email.send(
        `email://localhost:${SMTP_PORT}/?to=recipient@example.com`,
        { title: 'Test' },
      ),
    ).rejects.toThrow('Sender email address (from) is required')
  })
})
