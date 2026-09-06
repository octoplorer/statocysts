import type { CommandModule } from 'yargs'
import { createNotifier, NotificationDeliveryError } from 'statocysts'
import { CliExitError, getErrorMessage } from '../errors'
import { getBody } from '../input'

interface SendOptions {
  url: string[]
  title?: string
  body?: string
  file?: string
}

async function sendNotifications(urls: string[], title: string, body?: string): Promise<void> {
  const notifier = createNotifier(urls)
  await notifier.send({ title, body })
}

/**
 * Default command (no subcommand): send a notification.
 *
 * The handler owns all user-facing output and throws a CliExitError when the
 * delivery fails so that `run()` can map the failure onto the exit code.
 */
export const sendCommand: CommandModule<object, SendOptions> = {
  command: '$0',
  describe: 'Send a notification',
  builder: yargs =>
    yargs
      .usage('$0 -u <url> [-t <title>] [-b <body> | -f <file>]')
      .option('url', {
        alias: 'u',
        type: 'string',
        array: true,
        demandOption: true,
        description: 'Notification service URL(s)',
      })
      .option('title', {
        alias: 't',
        type: 'string',
        description: 'Notification title',
      })
      .option('body', {
        alias: 'b',
        type: 'string',
        description: 'Notification body content',
      })
      .option('file', {
        alias: 'f',
        type: 'string',
        description: 'Read body content from file',
      })
      .example([
        ['$0 -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -b "Hello World"', 'Send notification to Slack webhook'],
        ['$0 -u "slack://webhook/a/b/c" -u "json://example.com/api" -t "Alert" -b "Hello"', 'Send to multiple URLs'],
        ['$0 -u "slack://webhook/xxx/yyy/zzz" -t "Alert" -f message.txt', 'Send with body from file'],
        ['echo "Hello" | $0 -u "slack://webhook/xxx/yyy/zzz" -t "Alert"', 'Send with body from stdin'],
        ['$0 -u "slack://webhook/xxx/yyy/zzz" -t "Simple Alert"', 'Send title only'],
      ]),
  handler: async (argv) => {
    if (!argv.title) {
      throw new Error('Notification title is required (use -t <title>)')
    }

    try {
      const body = await getBody(argv)
      await sendNotifications(argv.url ?? [], argv.title, body || undefined)
      console.log('Notification sent successfully!')
    }
    catch (error) {
      if (error instanceof NotificationDeliveryError) {
        console.error('\nFailed to send to some URLs:')
        error.failures.forEach((failure) => {
          console.error(`  - ${failure.target}: ${getErrorMessage(failure.cause)}`)
        })
      }
      else {
        console.error(`Error: ${getErrorMessage(error)}`)
      }
      throw new CliExitError(1)
    }
  },
}
