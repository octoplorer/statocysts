import process from 'node:process'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version } from '../package.json' with { type: 'json' }
import { sendCommand } from './commands/send'
import { verifyCommand } from './commands/verify'
import { CliExitError, getErrorMessage } from './errors'

/**
 * Run the CLI and resolve with the process exit code
 *
 * Argument parsing is delegated to yargs. Each command owns its user-facing
 * output; runtime failures surface as a CliExitError carrying the exit code,
 * while parse-time errors are reported here.
 */
export async function run(args: string[] = hideBin(process.argv)): Promise<number> {
  try {
    await yargs(args)
      .scriptName('stato')
      .usage('$0 [command]')
      .command(sendCommand)
      .command(verifyCommand)
      .help()
      .version(version)
      .strict()
      .exitProcess(false)
      .fail((msg, err) => {
        throw err ?? new Error(msg)
      })
      .parse()

    return 0
  }
  catch (error) {
    if (error instanceof CliExitError) {
      return error.exitCode
    }

    console.error(`Error: ${getErrorMessage(error)}`)
    return 1
  }
}
