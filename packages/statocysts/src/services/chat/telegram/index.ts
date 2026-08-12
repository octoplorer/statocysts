import type { FetchOptions } from 'ofetch'
import * as v from 'valibot'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'
import { escapeHtml, escapeMarkdown, safeParseQuery } from '#/utils'
import { assert } from '#/utils/assert'

export const telegramQuerySchema = v.object({
  parse_mode: v.optional(v.picklist(['Markdown', 'MarkdownV2', 'HTML'])),
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
    assert(url.username, 'Bot token is required')

    // Extract chat IDs from pathname (e.g., /chat-1/chat-2)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    assert(pathSegments.length > 0, 'At least one chat ID is required')

    const queryResult = safeParseQuery(url, telegramQuerySchema)

    if (!queryResult.success) {
      throw new Error('Invalid telegram query')
    }

    const query = queryResult.output

    // Bot token is in the username and password fields, because token contains `:` character
    const botToken = `${url.username}:${url.password}`

    // First chat ID from pathname (decode to handle @ symbols like @mychannel)
    // Support format: chat-id or chat-id:message-thread-id
    const chatPart = decodeURIComponent(pathSegments[0])
    const [chatId, messageThreadId] = chatPart.includes(':')
      ? chatPart.split(':', 2)
      : [chatPart, undefined]

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
      let bodyFormatted: string

      if (parseMode === 'HTML') {
        // Escape title and body to prevent breaking HTML tags
        titleFormatted = `<b>${escapeHtml(this.message.title)}</b>`
        bodyFormatted = escapeHtml(this.message.body)
      }
      else if (parseMode === 'MarkdownV2') {
        // MarkdownV2 requires escaping special characters in title and body
        const escapedTitle = escapeMarkdown(this.message.title)
        titleFormatted = `*${escapedTitle}*`
        bodyFormatted = escapeMarkdown(this.message.body)
      }
      else {
        // Markdown or default - escape special chars to prevent parse errors
        titleFormatted = `*${escapeMarkdown(this.message.title)}*`
        bodyFormatted = escapeMarkdown(this.message.body)
      }

      text = `${titleFormatted}\n\n${bodyFormatted}`
    }
    else {
      // No body, title is the main content
      // Need to escape special characters in MarkdownV2/HTML mode
      if (query.parse_mode === 'MarkdownV2') {
        text = escapeMarkdown(this.message.title)
      }
      else if (query.parse_mode === 'HTML') {
        text = escapeHtml(this.message.title)
      }
      else {
        text = this.message.title
      }
    }

    const body: Record<string, any> = {
      chat_id: chatId,
      text,
      parse_mode: query.parse_mode,
    }

    // Add message_thread_id if specified (for topic/forum groups)
    if (messageThreadId) {
      body.message_thread_id = Number.parseInt(messageThreadId, 10)
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
