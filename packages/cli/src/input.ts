import * as fs from 'node:fs'
import process from 'node:process'
import * as readline from 'node:readline'

export interface BodyOptions {
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
export async function getBody(args: BodyOptions): Promise<string> {
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
