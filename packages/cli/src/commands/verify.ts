import type { CommandModule } from 'yargs'
import { createNotifier } from 'statocysts'
import { CliExitError, getErrorMessage } from '../errors'

interface VerifyOptions {
  url: string[]
}

/**
 * Check each URL against the runtime's local and provider-specific validation
 * without sending a notification or contacting remote services.
 * Prints a per-URL result and throws a CliExitError when any URL is invalid.
 */
function verifyUrls(urls: string[]): void {
  let allValid = true

  for (const url of urls) {
    try {
      createNotifier([url])
      console.log(`✓ ${url}`)
    }
    catch (error) {
      allValid = false
      console.error(`✗ ${url}: ${getErrorMessage(error)}`)
    }
  }

  if (!allValid) {
    throw new CliExitError(1)
  }
}

export const verifyCommand: CommandModule<object, VerifyOptions> = {
  command: 'verify',
  describe: 'Verify notification service URL(s)',
  builder: yargs =>
    yargs
      .usage('$0 verify -u <url> [-u <url2> ...]')
      .option('url', {
        alias: 'u',
        type: 'string',
        array: true,
        demandOption: true,
        description: 'Notification service URL(s)',
      })
      .example('$0 verify -u "slack://webhook/xxx/yyy/zzz"', 'Verify notification service URL(s)'),
  handler: (argv) => {
    verifyUrls(argv.url ?? [])
  },
}
