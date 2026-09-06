/**
 * Error thrown by command handlers to signal a non-zero process exit.
 *
 * Commands are responsible for printing any diagnostic output before
 * throwing; `run()` only maps the carried exit code onto the process.
 */
export class CliExitError extends Error {
  constructor(public readonly exitCode: number) {
    super(`command exited with code ${exitCode}`)
    this.name = 'CliExitError'
  }
}

/** Normalize an unknown thrown value into a printable message. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
