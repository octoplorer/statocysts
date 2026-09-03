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
  validate(ctx) {
    const { url } = ctx

    const queryResult = v.safeParse(querySchema, {
      level: url.searchParams.get('level') || undefined,
    })

    if (!queryResult.success) {
      throw new Error('Invalid logger query parameters')
    }

    return {
      level: (queryResult.output.level ?? 'info') as LoggerLevel,
    }
  },
  async prepare(ctx) {
    const { message, validated } = ctx

    return {
      level: validated.level,
      title: message.title,
      body: message.body,
    }
  },
})
