import type { LoggerLevel } from './transport'
import * as v from 'valibot'
import { defineProvider } from '#/core/provider'
import { loggerTransport } from './transport'

const levelSchema = v.picklist(['debug', 'info', 'warn', 'error'])

const querySchema = v.object({
  level: v.optional(levelSchema),
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

    const queryResult = v.safeParse(querySchema, {
      level: url.searchParams.get('level') || undefined,
    })

    if (!queryResult.success) {
      throw new Error('Invalid logger query parameters')
    }

    return {
      level: (queryResult.output.level ?? 'info') as LoggerLevel,
      title: message.title,
      body: message.body,
    }
  },
})
