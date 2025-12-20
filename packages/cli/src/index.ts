import * as fs from 'node:fs'
import process from 'node:process'
import * as readline from 'node:readline'
import { send } from 'statocysts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

interface CliArgs {
  url: string[]
  title: string
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
  const results = await Promise.allSettled(
    urls.map(url => send(url, title, body)),
  )

  const failures: { url: string, error: string }[] = []

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      failures.push({
        url: urls[index],
        error: result.reason?.message || String(result.reason),
      })
    }
  })

  if (failures.length > 0) {
    console.error('\nFailed to send to some URLs:')
    failures.forEach(({ url, error }) => {
      console.error(`  - ${url}: ${error}`)
    })

    if (failures.length === urls.length) {
      process.exit(1)
    }
  }
}

export async function run(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('stato')
    .usage('$0 -u <url> -t <title> [-b <body> | -f <file>]')
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
      demandOption: true,
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
    ])
    .help()
    .version()
    .strict()
    .parse() as CliArgs

  try {
    const body = await getBody(argv)

    await sendNotifications(argv.url, argv.title, body || undefined)
    console.log('Notification sent successfully!')
  }
  catch (error) {
    console.error(`Error: ${(error as Error).message}`)
    process.exit(1)
  }
}
