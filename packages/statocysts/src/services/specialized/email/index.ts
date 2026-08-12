import type { SMTPConnectionOptions } from 'emailjs'
import type { SmtpPayload } from '#/core/transports/smtp'
import * as v from 'valibot'
import { defineProvider } from '#/core/provider'
import { smtp } from '#/core/transports/smtp'
import { assert } from '#/utils'

export interface EmailOptions {
  // Optional default sender email address
  defaultFrom?: string
  // Optional default SMTP configuration
  smtpConfig?: Partial<SMTPConnectionOptions>
}

// Valibot schema for validating single-value query parameters
const queryParamSchema = v.object({
  from: v.optional(v.pipe(v.string(), v.email())),
  subject: v.optional(v.string()),
  ssl: v.optional(v.pipe(v.string(), v.transform(val => val === 'true'))),
  tls: v.optional(v.pipe(v.string(), v.transform(val => val !== 'false'))),
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
    const queryResult = v.safeParse(queryParamSchema, {
      from: from || undefined,
      subject: subject || undefined,
      ssl: sslParam || undefined,
      tls: tlsParam || undefined,
    })

    if (!queryResult.success) {
      const message = v.flatten(queryResult.issues).root?.join('; ')
      throw new Error(`Invalid email query parameters: ${message ?? 'validation failed'}`)
    }

    const query = queryResult.output

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
        // Only include auth if both user and password are provided
        ...(user && password ? { user, password } : {}),
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
