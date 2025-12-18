#!/usr/bin/env node
import * as fs from 'node:fs'
import process from 'node:process'
import * as readline from 'node:readline'
import { send } from 'statocysts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

interface CliArgs {
  url: string[]
  message?: string
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
 * Priority: --message > --file > stdin
 */
async function getMessage(args: CliArgs): Promise<string> {
  // Priority 1: Direct message argument
  if (args.message) {
    return args.message
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
async function sendNotifications(urls: string[], message: string): Promise<void> {
  const results = await Promise.allSettled(
    urls.map(url => send(url, message)),
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

async function main(): Promise<void> {
  const argv = await yargs(hideBin(process.argv))
    .scriptName('stato')
    .usage('$0 -u <url> [-m <message> | -f <file>]')
    .option('url', {
      alias: 'u',
      type: 'string',
      array: true,
      demandOption: true,
      description: 'Notification service URL(s)',
    })
    .option('message', {
      alias: 'm',
      type: 'string',
      description: 'Message content to send',
    })
    .option('file', {
      alias: 'f',
      type: 'string',
      description: 'Read message content from file',
    })
    .example([
      ['$0 -u "slack://webhook/xxx/yyy/zzz" -m "Hello World"', 'Send message to Slack webhook'],
      ['$0 -u "slack://webhook/a/b/c" -u "json://example.com/api" -m "Hello"', 'Send to multiple URLs'],
      ['$0 -u "slack://webhook/xxx/yyy/zzz" -f message.txt', 'Send message from file'],
      ['echo "Hello" | $0 -u "slack://webhook/xxx/yyy/zzz"', 'Send message from stdin'],
    ])
    .help()
    .version()
    .strict()
    .parse() as CliArgs

  try {
    const message = await getMessage(argv)

    if (!message) {
      console.error('Error: No message provided. Use -m, -f, or pipe content via stdin.')
      process.exit(1)
    }

    await sendNotifications(argv.url, message)
    console.log('Notification sent successfully!')
  }
  catch (error) {
    console.error(`Error: ${(error as Error).message}`)
    process.exit(1)
  }
}

main()
