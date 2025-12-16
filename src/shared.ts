export * from './services/chat'
export * from './services/specialized'

export type Protocol = 'generic:' | 'slack:'

export const SUPPORTED_PROTOCOLS = ['generic:', 'slack:']
