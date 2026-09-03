import * as fs from 'node:fs'
import process from 'node:process'
import * as readline from 'node:readline'
import { createNotifier, NotificationDeliveryError } from 'statocysts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { version } from '../package.json' with { type: 'json' }

interface CliArgs {
  _: (string | number)[]
  help?: boolean
  version?: boolean
  url: string[]
  title?: string
  body?: string
  file?: string
}

/**
 * Read message content from stdin
 */
async function readFromStdin(): Promise<string> {
  // Check if stdin is a TTY (interactive terminal)
  if (process.stdin.isTTY) {
    return ''
  }

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      terminal: false,
    })

    const lines: string[] = []

    rl.on('line', (line) => {
      lines.push(line)
    })

    rl.on('close', () => {
      resolve(lines.join('\n'))
    })

    rl.on('error', reject)
  })
}

/**
 * Get message content from various sources
 * Priority: --body > --file > stdin
 */
async function getBody(args: CliArgs): Promise<string> {
  // Priority 1: Direct body argument
  if (args.body) {
    return args.body
  }

  // Priority 2: Read from file
  if (args.file) {
    try {
      return fs.readFileSync(args.file, 'utf-8').trim()
    }
    catch (error) {
      throw new Error(`Failed to read file "${args.file}": ${(error as Error).message}`)
    }
  }

  // Priority 3: Read from stdin
  const stdinContent = await readFromStdin()
  if (stdinContent) {
    return stdinContent.trim()
  }

  return ''
}

/**
 * Send notifications to all specified URLs
 */
async function sendNotifications(urls: string[], title: string, body?: string): Promise<void> {
  const notifier = createNotifier(urls)
  await notifier.send({ title, body })
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Verify each URL against the runtime's local and provider-specific validation
 * without sending a notification or contacting remote services
 * Returns the process exit code (0 = all valid, 1 = any invalid)
 */
function verifyUrls(urls: string[]): number {
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

  return allValid ? 0 : 1
}

/**
 * Run the CLI and resolve with the process exit code
 */
export async function run(args: string[] = hideBin(process.argv)): Promise<number> {
  let argv: CliArgs
  try {
    argv = await yargs(args)
      .scriptName('stato')
      .usage('$0 [verify] -u <url> [-t <title>] [-b <body> | -f <file>]')
      .command('verify', 'Verify notification service URL(s)', yargs => yargs
        .option('url', {
          alias: 'u',
          type: 'string',
          array: true,
          demandOption: true,
          description: 'Notification service URL(s)',
        }))
      .option('url', {
        alias: 'u',
        type: 'string',
        array: true,
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
        ['$0 verify -u "slack://webhook/xxx/yyy/zzz"', 'Verify notification service URL(s)'],
      ])
      .help()
      .version(version)
      .strict()
      .exitProcess(false)
      .fail((msg, err) => {
        throw err ?? new Error(msg)
      })
      .parse() as CliArgs
  }
  catch (error) {
    console.error(`Error: ${getErrorMessage(error)}`)
    return 1
  }

  if (argv.help || argv.version) {
    return 0
  }

  if (argv._[0] === 'verify') {
    return verifyUrls(argv.url)
  }

  // Default send path (kept for backward compatibility)
  try {
    if (!argv.title) {
      throw new Error('Notification title is required (use -t <title>)')
    }

    const body = await getBody(argv)

    await sendNotifications(argv.url, argv.title, body || undefined)
    console.log('Notification sent successfully!')
    return 0
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
    return 1
  }
}
