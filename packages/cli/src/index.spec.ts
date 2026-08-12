import { afterEach, describe, expect, it, vi } from 'vitest'
import { run } from './index'

describe('stato CLI', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends a notification by default (no subcommand)', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    const code = await run(['-u', 'logger://', '-t', 'Hello', '-b', 'Body'])

    expect(code).toBe(0)
    expect(infoSpy).toHaveBeenCalledWith('[statocysts] Hello\nBody')
    expect(logSpy).toHaveBeenCalledWith('Notification sent successfully!')
  })

  it('reports a send failure with a non-zero exit code', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const code = await run(['-u', 'unsupported://target', '-t', 'Hello', '-b', 'Body'])

    expect(code).toBe(1)
    expect(errorSpy).toHaveBeenCalledWith('Error: Unsupported notification protocol: unsupported:')
  })

  it('verifies a valid URL', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const code = await run(['verify', '-u', 'logger://'])

    expect(code).toBe(0)
    expect(logSpy).toHaveBeenCalledWith('✓ logger://')
  })

  it('verifies multiple URLs', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const code = await run(['verify', '-u', 'logger://', '-u', 'unsupported://target'])

    expect(code).toBe(1)
    expect(logSpy).toHaveBeenCalledWith('✓ logger://')
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('✗ unsupported://target'))
  })

  it('reports an invalid URL with a non-zero exit code', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const code = await run(['verify', '-u', 'unsupported://target'])

    expect(code).toBe(1)
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('✗ unsupported://target'))
  })

  it('reports missing URL for verify with a non-zero exit code', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const code = await run(['verify'])

    expect(code).toBe(1)
    expect(errorSpy).toHaveBeenCalled()
  })
})
