import type { LoggerLevel } from './transport'
import z from 'zod'
import { defineProvider } from '#/core/provider'
import { loggerTransport } from './transport'

const levelSchema = z.enum(['debug', 'info', 'warn', 'error'])

const querySchema = z.object({
  level: levelSchema.optional(),
})

/**
 * Logger notification provider
 *
 * Writes notifications to the console for development and debugging.
 * Address syntax: `logger://[?level=debug|info|warn|error]`
 */
export const logger = defineProvider('logger:', {
  transport: loggerTransport,
  async prepare(ctx) {
    const { url, message } = ctx

    const queryResult = querySchema.safeParse({
      level: url.searchParams.get('level') || undefined,
    })

    if (!queryResult.success) {
      throw new Error('Invalid logger query parameters')
    }

    return {
      level: (queryResult.data.level ?? 'info') as LoggerLevel,
      title: message.title,
      body: message.body,
    }
  },
})
