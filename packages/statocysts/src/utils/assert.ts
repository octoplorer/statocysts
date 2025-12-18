export function assert(condition: any, message: string | Error): asserts condition {
  if (!condition) {
    throw typeof message === 'string' ? new Error(message) : message
  }
}
