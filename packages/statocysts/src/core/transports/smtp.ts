import type { Message, MessageHeaders, SMTPConnectionOptions } from 'emailjs'
import { SMTPClient } from 'emailjs'
import { defineTransport } from '../transport'

/**
 * SMTP payload for SMTP transport
 */
export interface SmtpPayload {
  /**
   * SMTP client configuration
   */
  client: Partial<SMTPConnectionOptions>
  /**
   * Email message to send
   */
  message: Message | MessageHeaders
}

/**
 * SMTP transport implementation
 * Handles sending emails over SMTP protocol using emailjs
 */
export const smtp = defineTransport({
  async send(payload: SmtpPayload) {
    const client = new SMTPClient(payload.client)
    await client.sendAsync(payload.message)
  },
})
