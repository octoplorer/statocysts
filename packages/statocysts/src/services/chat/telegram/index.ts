import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { getValidateQuery } from '#/utils'
import { assert } from '#/utils/assert'
import z from 'zod'

export const telegramQuerySchema = z.object({
  parse_mode: z.enum(['Markdown', 'MarkdownV2', 'HTML']).optional(),
})

export interface TelegramOptions {
  /**
   * The base URL for Telegram Bot API
   *
   * @default `https://api.telegram.org`
   */
  apiBaseUrl?: string

  fetchOptions?: FetchOptions
}

export const telegram = defineProvider('telegram:', {
  transport: http,
  defaultOptions: {
    apiBaseUrl: 'https://api.telegram.org',
  } as TelegramOptions,
  async prepare(_, options) {
    const { url } = this

    // Validate URL format
    assert(url.hostname === 'bot', `Invalid telegram URL: ${url.toString()}`)
    assert(url.username, 'Chat ID is required')
    assert(url.password, 'Bot token is required')

    const queryResult = getValidateQuery(url, telegramQuerySchema.safeParse)

    if (!queryResult.success) {
      throw new Error('Invalid telegram query')
    }

    const query = queryResult.data

    // Decode chat ID to handle @ symbols (e.g., @mychannel)
    const chatId = decodeURIComponent(url.username)
    const botToken = url.password

    // Build API URL
    const requestUrl = new URL(`/bot${botToken}/sendMessage`, options.apiBaseUrl)

    const headers = new Headers([
      ['Content-Type', 'application/json'],
    ])

    // Build message text based on parse_mode
    let text: string
    if (this.message.body) {
      // Title as h1, body as content
      const parseMode = query.parse_mode
      let titleFormatted: string

      if (parseMode === 'HTML') {
        titleFormatted = `<b>${this.message.title}</b>`
      }
      else if (parseMode === 'MarkdownV2') {
        // MarkdownV2 requires escaping special characters
        const escapedTitle = this.message.title.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1')
        titleFormatted = `*${escapedTitle}*`
      }
      else {
        // Markdown or default
        titleFormatted = `*${this.message.title}*`
      }

      text = `${titleFormatted}\n\n${this.message.body}`
    }
    else {
      // No body, title is the main content (no special formatting)
      text = this.message.title
    }

    const body: Record<string, any> = {
      chat_id: chatId,
      text,
      parse_mode: query.parse_mode,
    }

    const request = new Request(requestUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    return {
      request,
      fetchOptions: options.fetchOptions,
    }
  },
})
