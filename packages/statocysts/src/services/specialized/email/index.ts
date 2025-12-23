import type { SmtpPayload } from '#/core/transports/smtp'
import type { SMTPConnectionOptions } from 'emailjs'
import { defineProvider } from '#/core/provider'
import { smtp } from '#/core/transports/smtp'
import { assert } from '#/utils'
import z from 'zod'

export interface EmailOptions {
  // Optional default sender email address
  defaultFrom?: string
  // Optional default SMTP configuration
  smtpConfig?: Partial<SMTPConnectionOptions>
}

// Zod schema for validating single-value query parameters
const queryParamSchema = z.object({
  from: z.string().email().optional(),
  subject: z.string().optional(),
  ssl: z.string().transform(val => val === 'true').optional(),
  tls: z.string().transform(val => val !== 'false').optional(),
})

export const email = defineProvider('email:', {
  transport: smtp,
  defaultOptions: {} as EmailOptions,
  async prepare(ctx, options) {
    const { url, message } = ctx

    // Parse query parameters (use getAll for multi-value parameters)
    const to = url.searchParams.getAll('to')
    const cc = url.searchParams.getAll('cc')
    const bcc = url.searchParams.getAll('bcc')

    // Parse single-value parameters
    const from = url.searchParams.get('from')
    const subject = url.searchParams.get('subject')
    const sslParam = url.searchParams.get('ssl')
    const tlsParam = url.searchParams.get('tls')

    // Validate single-value parameters
    const queryResult = queryParamSchema.safeParse({
      from: from || undefined,
      subject: subject || undefined,
      ssl: sslParam || undefined,
      tls: tlsParam || undefined,
    })

    if (!queryResult.success) {
      throw new Error(`Invalid email query parameters: ${queryResult.error.message}`)
    }

    const query = queryResult.data

    // Build SMTP client configuration
    const host = url.hostname
    assert(host, 'SMTP host is required')

    const port = url.port ? Number.parseInt(url.port, 10) : 587
    const user = decodeURIComponent(url.username || '')
    const password = decodeURIComponent(url.password || '')

    // Determine sender address
    const fromAddress = query.from || options.defaultFrom || user
    assert(fromAddress, 'Sender email address (from) is required')

    // Ensure at least one recipient is provided
    assert(to.length > 0, 'At least one recipient email address (to) is required')

    // Build email message
    const emailSubject = query.subject || message.title
    const text = message.body
      ? `${message.title}\n\n${message.body}`
      : message.title

    // Build SMTP payload
    const smtpPayload: SmtpPayload = {
      client: {
        host,
        port,
        user: user || undefined,
        password: password || undefined,
        ssl: query.ssl ?? false,
        tls: query.tls ?? (port === 587),
        ...options.smtpConfig,
      },
      message: {
        from: fromAddress,
        to: to.join(', '), // emailjs accepts comma-separated string
        cc: cc.length > 0 ? cc.join(', ') : undefined,
        bcc: bcc.length > 0 ? bcc.join(', ') : undefined,
        subject: emailSubject,
        text,
      },
    }

    return smtpPayload
  },
})
