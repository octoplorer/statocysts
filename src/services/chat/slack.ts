import { assert } from '#/utils/assert'
import { z } from 'zod'
import { defineProvider } from '../../core/provider'

const slackOptionsSchema = z.object({
  botname: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  title: z.string().optional(),
  thread_ts: z.string().optional(),
})

export type SlackOptions = z.infer<typeof slackOptionsSchema>

function isBotApiFormat(url: URL): boolean {
  return url.username === 'xoxb'
}

function isWebhookFormat(url: URL): boolean {
  return url.username === 'hook'
}

function parseBotToken(url: URL): string {
  // In slack://xoxb:TOKEN@CHANNEL, password is the token
  assert(url.password, 'Bot token is required')
  return url.password
}

function parseWebhookToken(url: URL): { id: string, token: string, secret: string } {
  // In slack://hook:ID-TOKEN-SECRET@webhook, password contains ID-TOKEN-SECRET
  assert(url.password, 'Webhook token is required')
  const parts = url.password.split('-')
  assert(parts.length === 3, 'Invalid webhook token format')
  return {
    id: parts[0],
    token: parts[1],
    secret: parts[2],
  }
}

function buildBotApiRequest(url: URL, message: string, options: SlackOptions): Request {
  const token = parseBotToken(url)
  const channel = url.hostname

  const body: Record<string, any> = {
    channel,
    text: message,
  }

  if (options.botname) {
    body.username = options.botname
  }

  if (options.icon) {
    // Check if it's an emoji (starts with :) or a URL
    if (options.icon.startsWith(':') && options.icon.endsWith(':')) {
      body.icon_emoji = options.icon
    }
    else {
      body.icon_url = options.icon
    }
  }

  if (options.thread_ts) {
    body.thread_ts = options.thread_ts
  }

  // Build attachments for color and title
  const attachments: Array<Record<string, any>> = []
  if (options.color || options.title) {
    const attachment: Record<string, any> = {}
    if (options.color) {
      // Decode URL-encoded hex color (e.g., %23ff8000 -> #ff8000)
      attachment.color = options.color.startsWith('%23') ? decodeURIComponent(options.color) : options.color
    }
    if (options.title) {
      attachment.title = options.title
    }
    attachments.push(attachment)
  }

  if (attachments.length > 0) {
    body.attachments = attachments
  }

  return new Request('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer xoxb-${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

function buildWebhookRequest(url: URL, message: string, options: SlackOptions): Request {
  const { id, token, secret } = parseWebhookToken(url)

  const body: Record<string, any> = {
    text: message,
  }

  if (options.botname) {
    body.username = options.botname
  }

  if (options.icon) {
    // Check if it's an emoji (starts with :) or a URL
    if (options.icon.startsWith(':') && options.icon.endsWith(':')) {
      body.icon_emoji = options.icon
    }
    else {
      body.icon_url = options.icon
    }
  }

  // Build attachments for color and title
  const attachments: Array<Record<string, any>> = []
  if (options.color || options.title) {
    const attachment: Record<string, any> = {}
    if (options.color) {
      // Decode URL-encoded hex color (e.g., %23ff8000 -> #ff8000)
      attachment.color = options.color.startsWith('%23') ? decodeURIComponent(options.color) : options.color
    }
    if (options.title) {
      attachment.title = options.title
    }
    attachments.push(attachment)
  }

  if (attachments.length > 0) {
    body.attachments = attachments
  }

  return new Request(`https://hooks.slack.com/services/${id}/${token}/${secret}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

function extractSlackParams(url: URL): unknown {
  const params = new URLSearchParams(url.search)
  return Object.fromEntries(params.entries())
}

function createSlackRequest(this: { url: URL, params: SlackOptions, message: string }): Request {
  const { url, params: options, message } = this
  assert(url.protocol === 'slack:', `Unexpected protocol ${url.protocol}`)

  if (isBotApiFormat(url)) {
    return buildBotApiRequest(url, message, options)
  }

  if (isWebhookFormat(url)) {
    return buildWebhookRequest(url, message, options)
  }

  throw new Error(`Unsupported Slack URL format: ${url.toString()}`)
}

export const slackProvider = defineProvider('slack:', {
  extractor: extractSlackParams,
  parser: data => slackOptionsSchema.parse(data),
  createRequest: createSlackRequest,
})

// Keep for backward compatibility
export function buildSlackRequest(url: URL, message: string): Request {
  assert(url.protocol === 'slack:', `Unexpected protocol ${url.protocol}`)

  // Parse query parameters
  const params = new URLSearchParams(url.search)
  const options: SlackOptions = slackOptionsSchema.parse(Object.fromEntries(params.entries()))

  if (isBotApiFormat(url)) {
    return buildBotApiRequest(url, message, options)
  }

  if (isWebhookFormat(url)) {
    return buildWebhookRequest(url, message, options)
  }

  throw new Error(`Unsupported Slack URL format: ${url.toString()}`)
}
