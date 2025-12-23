import type { SmtpPayload } from '#/core/transports/smtp'
import type { MessageHeaders } from 'emailjs'
import { smtp } from '#/core/transports/smtp'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { email } from './index'

// Mock smtp transport
vi.mock('#/core/transports/smtp', () => ({
  smtp: {
    send: vi.fn(),
  },
}))

describe('email provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to extract payload and message
  function getLastCall() {
    const payload = vi.mocked(smtp.send).mock.calls[0][0] as SmtpPayload
    const message = payload.message as MessageHeaders
    return { payload, message }
  }

  it('should send basic email with required parameters', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com',
      { title: 'Test Email' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { payload, message } = getLastCall()

    expect(payload.client.host).toBe('smtp.example.com')
    expect(payload.client.port).toBe(587)
    expect(payload.client.tls).toBe(true)
    expect(message.from).toBe('sender@example.com')
    expect(message.to).toBe('recipient@example.com')
    expect(message.subject).toBe('Test Email')
    expect(message.text).toBe('Test Email')
  })

  it('should send email with SMTP authentication', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://user123:pass456@smtp.example.com/?from=sender@example.com&to=recipient@example.com',
      { title: 'Auth Test' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { payload } = getLastCall()

    expect(payload.client.user).toBe('user123')
    expect(payload.client.password).toBe('pass456')
  })

  it('should send email to multiple recipients', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?from=sender@example.com&to=user1@example.com&to=user2@example.com&to=user3@example.com',
      { title: 'Multiple Recipients' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { message } = getLastCall()

    expect(message.to).toBe('user1@example.com, user2@example.com, user3@example.com')
  })

  it('should send email with cc and bcc', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com&cc=cc1@example.com&cc=cc2@example.com&bcc=bcc1@example.com',
      { title: 'CC and BCC Test' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { message } = getLastCall()

    expect(message.cc).toBe('cc1@example.com, cc2@example.com')
    expect(message.bcc).toBe('bcc1@example.com')
  })

  it('should handle empty cc and bcc arrays', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com',
      { title: 'No CC/BCC' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { message } = getLastCall()

    expect(message.cc).toBeUndefined()
    expect(message.bcc).toBeUndefined()
  })

  it('should use custom subject from query parameter', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com&subject=Custom+Subject',
      { title: 'Default Title' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { message } = getLastCall()

    expect(message.subject).toBe('Custom Subject')
  })

  it('should use defaultFrom option when from is not specified', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?to=recipient@example.com',
      { title: 'Test' },
      { defaultFrom: 'default@example.com' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { message } = getLastCall()

    expect(message.from).toBe('default@example.com')
  })

  it('should use username as from when from is not specified', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://myuser:pass@smtp.example.com/?to=recipient@example.com',
      { title: 'Test' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const { payload, message } = getLastCall()

    expect(message.from).toBe('myuser')
    expect(payload.client.user).toBe('myuser')
    expect(payload.client.password).toBe('pass')
  })

  it('should configure SSL and TLS correctly', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com:465/?from=sender@example.com&to=recipient@example.com&ssl=true&tls=false',
      { title: 'SSL Test' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const payload = vi.mocked(smtp.send).mock.calls[0][0] as SmtpPayload

    expect(payload.client.port).toBe(465)
    expect(payload.client.ssl).toBe(true)
    expect(payload.client.tls).toBe(false)
  })

  it('should default to TLS for port 587', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com:587/?from=sender@example.com&to=recipient@example.com',
      { title: 'TLS Default Test' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const payload = vi.mocked(smtp.send).mock.calls[0][0] as SmtpPayload

    expect(payload.client.tls).toBe(true)
  })

  it('should handle message with body', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com',
      { title: 'Title', body: 'This is the body content' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const payload = vi.mocked(smtp.send).mock.calls[0][0] as SmtpPayload

    expect(payload.message.text).toBe('Title\n\nThis is the body content')
  })

  it('should decode URL encoded username and password', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://user%40domain:p%40ss%20word@smtp.example.com/?from=sender@example.com&to=recipient@example.com',
      { title: 'Decode Test' },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const payload = vi.mocked(smtp.send).mock.calls[0][0] as SmtpPayload

    expect(payload.client.user).toBe('user@domain')
    expect(payload.client.password).toBe('p@ss word')
  })

  it('should throw error when host is missing', async () => {
    await expect(
      email.send(
        'email://?from=sender@example.com&to=recipient@example.com',
        { title: 'Test' },
      ),
    ).rejects.toThrow('SMTP host is required')
  })

  it('should throw error when to is missing', async () => {
    await expect(
      email.send(
        'email://smtp.example.com/?from=sender@example.com',
        { title: 'Test' },
      ),
    ).rejects.toThrow('At least one recipient email address (to) is required')
  })

  it('should throw error when from is missing and no default', async () => {
    await expect(
      email.send(
        'email://smtp.example.com/?to=recipient@example.com',
        { title: 'Test' },
      ),
    ).rejects.toThrow('Sender email address (from) is required')
  })

  it('should merge smtpConfig from options', async () => {
    vi.mocked(smtp.send).mockResolvedValue(undefined)

    await email.send(
      'email://smtp.example.com/?from=sender@example.com&to=recipient@example.com',
      { title: 'Test' },
      {
        smtpConfig: {
          timeout: 5000,
        },
      },
    )

    expect(smtp.send).toHaveBeenCalledTimes(1)
    const payload = vi.mocked(smtp.send).mock.calls[0][0] as SmtpPayload

    expect(payload.client.timeout).toBe(5000)
  })
})
