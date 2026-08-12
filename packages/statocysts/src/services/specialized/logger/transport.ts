import { defineTransport } from '#/core/transport'

export type LoggerLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Payload for the logger transport
 */
export interface LoggerPayload {
  level: LoggerLevel
  title: string
  body?: string
}

/**
 * Local transport that writes notifications to the console
 * Used by the logger provider; performs no network I/O.
 */
export const loggerTransport = defineTransport<LoggerPayload>({
  // The sole purpose of this transport is writing to the console
  /* eslint-disable no-console */
  async send(payload: LoggerPayload): Promise<void> {
    const lines = [`[statocysts] ${payload.title}`]
    if (payload.body) {
      lines.push(payload.body)
    }
    console[payload.level](lines.join('\n'))
  },
  /* eslint-enable no-console */
})
