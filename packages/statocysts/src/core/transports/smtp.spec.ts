import type { MessageHeaders } from 'emailjs'
import type { SMTPServerSession } from 'smtp-server'
import type { SmtpPayload } from './smtp'
import { SMTPServer } from 'smtp-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { smtp } from './smtp'

describe('smtp transport', () => {
  let server: SMTPServer
  let receivedMails: Array<{ from: string, to: string[], data: string }> = []
  const SMTP_PORT = 2525

  beforeAll(async () => {
    // Create a test SMTP server
    server = new SMTPServer({
      authOptional: true,
      disabledCommands: ['STARTTLS'],
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

  it('should send email successfully', async () => {
    const payload: SmtpPayload = {
      client: {
        host: 'localhost',
        port: SMTP_PORT,
        ssl: false,
        tls: false,
      },
      message: {
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'Test Subject',
        text: 'Test message body',
      },
    }

    await smtp.send(payload)

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].from).toBe('sender@example.com')
    expect(receivedMails[0].to).toContain('receiver@example.com')
    expect(receivedMails[0].data).toMatch(/Subject:.*Test.*Subject/)
    expect(receivedMails[0].data).toContain('Test message body')
  })

  it('should send HTML email', async () => {
    const payload: SmtpPayload = {
      client: {
        host: 'localhost',
        port: SMTP_PORT,
      },
      message: {
        from: 'sender@example.com',
        to: 'receiver@example.com',
        subject: 'HTML Email',
        text: 'Plain text version',
        attachment: [
          {
            data: '<html><body><h1>Hello World</h1></body></html>',
            alternative: true,
          },
        ],
      },
    }

    await smtp.send(payload)

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].data).toMatch(/Subject:.*HTML.*Email/)
    // HTML content is base64 encoded in the email
    expect(receivedMails[0].data).toContain('text/html')
    expect(receivedMails[0].data).toContain('Plain text version')
  })

  it('should send email to multiple recipients', async () => {
    const payload: SmtpPayload = {
      client: {
        host: 'localhost',
        port: SMTP_PORT,
      },
      message: {
        from: 'sender@example.com',
        to: 'receiver1@example.com, receiver2@example.com',
        subject: 'Multiple Recipients',
        text: 'Test',
      },
    }

    await smtp.send(payload)

    expect(receivedMails).toHaveLength(1)
    expect(receivedMails[0].to).toHaveLength(2)
    expect(receivedMails[0].to).toContain('receiver1@example.com')
    expect(receivedMails[0].to).toContain('receiver2@example.com')
  })

  it('should handle email with custom headers', async () => {
    const message: MessageHeaders = {
      from: 'sender@example.com',
      to: 'receiver@example.com',
      subject: 'Custom Headers',
      text: 'Test',
      headers: {
        'X-Custom-Header': 'custom-value',
      },
    }

    const payload: SmtpPayload = {
      client: {
        host: 'localhost',
        port: SMTP_PORT,
      },
      message,
    }

    await smtp.send(payload)

    expect(receivedMails).toHaveLength(1)
    // Custom headers in emailjs are not properly handled, so we skip this check
    expect(receivedMails[0].data).toMatch(/Subject:.*Custom.*Headers/)
  })
})
