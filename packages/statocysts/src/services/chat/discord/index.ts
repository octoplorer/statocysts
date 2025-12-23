import type { FetchOptions } from 'ofetch'
import { defineProvider } from '#/core/provider'
import { http } from '#/core/transports/http'

interface DiscordOptions {
  fetchOptions?: FetchOptions
}

export const discord = defineProvider('discord:', {
  transport: http,
  defaultOptions: {} as DiscordOptions,
  async prepare() {
    throw new Error('Not implemented')
  },
})
