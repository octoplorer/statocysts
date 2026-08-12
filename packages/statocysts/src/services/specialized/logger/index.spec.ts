import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '.'
import { loggerTransport } from './transport'

describe('logger provider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('outputs a single line with the title only', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    await logger.send('logger://', { title: 'Hello, world!' })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith('[statocysts] Hello, world!')
  })

  it('outputs title and body on separate lines', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    await logger.send('logger://', { title: 'Alert', body: 'CPU usage is above 90%' })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(infoSpy).toHaveBeenCalledWith('[statocysts] Alert\nCPU usage is above 90%')
  })

  it('uses console.info by default', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await logger.send('logger://', { title: 'Default level' })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(debugSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  it('maps the level query parameter to the matching console method', async () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await logger.send('logger://?level=debug', { title: 'Debug' })
    expect(debugSpy).toHaveBeenCalledWith('[statocysts] Debug')

    await logger.send('logger://?level=warn', { title: 'Warn' })
    expect(warnSpy).toHaveBeenCalledWith('[statocysts] Warn')

    await logger.send('logger://?level=error', { title: 'Error' })
    expect(errorSpy).toHaveBeenCalledWith('[statocysts] Error')
  })

  it('rejects an invalid level value without outputting anything', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    await expect(logger.send(
      'logger://?level=verbose',
      { title: 'Invalid level' },
    )).rejects.toThrow('Invalid logger query parameters')

    expect(infoSpy).not.toHaveBeenCalled()
  })

  it('resolves to undefined after outputting', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})

    await expect(logger.send('logger://', { title: 'Done' })).resolves.toBeUndefined()
  })

  it('performs no network requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('fetch should not be called')
    })
    vi.spyOn(console, 'info').mockImplementation(() => {})

    await logger.send('logger://', { title: 'No network' })

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('rejects a notification with a blank title', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    await expect(logger.send('logger://', { title: '   ' })).rejects.toThrow(TypeError)
    expect(infoSpy).not.toHaveBeenCalled()
  })
})

describe('logger transport', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders title and optional body lines', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    await loggerTransport.send({ level: 'info', title: 'T', body: 'B' })
    await loggerTransport.send({ level: 'info', title: 'T2' })

    expect(infoSpy).toHaveBeenNthCalledWith(1, '[statocysts] T\nB')
    expect(infoSpy).toHaveBeenNthCalledWith(2, '[statocysts] T2')
  })
})
