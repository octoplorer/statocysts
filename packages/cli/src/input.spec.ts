import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { getBody } from './input'

describe('getBody', () => {
  const dir = mkdtempSync(join(tmpdir(), 'statocysts-cli-'))

  afterAll(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it('returns --body content as-is', async () => {
    await expect(getBody({ body: 'Direct' })).resolves.toBe('Direct')
  })

  it('prefers --body over --file', async () => {
    const file = join(dir, 'message.txt')
    writeFileSync(file, 'From file', 'utf-8')

    await expect(getBody({ body: 'Direct', file })).resolves.toBe('Direct')
  })

  it('reads and trims --file content', async () => {
    const file = join(dir, 'message.txt')
    writeFileSync(file, '  From file\n', 'utf-8')

    await expect(getBody({ file })).resolves.toBe('From file')
  })

  it('throws when --file cannot be read', async () => {
    await expect(getBody({ file: join(dir, 'missing.txt') })).rejects.toThrow(
      /Failed to read file/,
    )
  })
})
