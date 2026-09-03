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

  it('reports a registered URL with invalid provider-specific components', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const code = await run(['verify', '-u', 'slack://webhook/a/b'])

    expect(code).toBe(1)
    expect(errorSpy).toHaveBeenCalledWith('✗ slack://webhook/a/b: Webhook URL is invalid')
  })

  it('reports mixed valid and provider-invalid URLs individually', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const code = await run([
      'verify',
      '-u',
      'logger://',
      '-u',
      'telegram://bot',
    ])

    expect(code).toBe(1)
    expect(logSpy).toHaveBeenCalledWith('✓ logger://')
    expect(errorSpy).toHaveBeenCalledWith('✗ telegram://bot: Bot token is required')
  })

  it('does not contact remote services while verifying a remote-auth provider', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('fetch should not be called'))

    const code = await run([
      'verify',
      '-u',
      'qqbot://app-id:client-secret@user/open-id',
    ])

    expect(code).toBe(0)
    expect(logSpy).toHaveBeenCalledWith('✓ qqbot://app-id:client-secret@user/open-id')
    expect(fetchSpy).not.toHaveBeenCalled()
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
