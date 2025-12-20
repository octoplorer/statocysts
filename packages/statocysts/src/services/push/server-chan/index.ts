import type { FetchOptions } from 'ofetch'
import { defineProvider, http } from '#/shared'

export const serverChan = defineProvider('server-chan:', {
  transport: http,
  defaultOptions: {
    fetchOptions: {} as FetchOptions,
  },
  prepare: async () => {
    throw new Error('Not implemented')
  },
})
