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
  validate(ctx, options) {
    const { url } = ctx

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

    return {
      bcc,
      cc,
      fromAddress,
      host,
      password,
      port,
      query,
      smtpConfig: options.smtpConfig,
      to,
      user,
    }
  },
  async prepare(ctx) {
    const { message, validated } = ctx
    const emailSubject = validated.query.subject || message.title
    const text = message.body
      ? `${message.title}\n\n${message.body}`
      : message.title

    // Build SMTP payload
    const smtpPayload: SmtpPayload = {
      client: {
        host: validated.host,
        port: validated.port,
        // Only include auth if both user and password are provided
        ...(validated.user && validated.password
          ? { user: validated.user, password: validated.password }
          : {}),
        ssl: validated.query.ssl ?? false,
        tls: validated.query.tls ?? (validated.port === 587),
        ...validated.smtpConfig,
      },
      message: {
        from: validated.fromAddress,
        to: validated.to.join(', '), // emailjs accepts comma-separated string
        cc: validated.cc.length > 0 ? validated.cc.join(', ') : undefined,
        bcc: validated.bcc.length > 0 ? validated.bcc.join(', ') : undefined,
        subject: emailSubject,
        text,
      },
    }

    return smtpPayload
  },
})
