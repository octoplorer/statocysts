import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '#/core/transports/http'
import { bark } from '.'

// Mock httpTransport
vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

describe('bark basic functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request with title only', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.day.app/push')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual(expect.objectContaining({
      device_keys: ['myDeviceKey'],
      markdown: 'Hello, world!',
    }))
  })

  it('should build a request with title and body', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.day.app/push')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      title: 'Test Title',
      markdown: 'This is the message body',
    })
  })

  it('should work with custom server URL', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://bark.example.com/deviceKey123',
      { title: 'Custom Server' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://bark.example.com/push')
    expect(await req.json()).toEqual({
      device_keys: ['deviceKey123'],
      markdown: 'Custom Server',
    })
  })

  it('should work with custom port', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://localhost:8080/deviceKey123',
      { title: 'Custom Port' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://localhost:8080/push')
  })
})

describe('bark query parameters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle subtitle parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?subtitle=Test%20Subtitle',
      { title: 'Title', body: 'Body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      title: 'Title',
      markdown: 'Body',
      subtitle: 'Test Subtitle',
    })
  })

  it('should handle group parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?group=MyGroup',
      { title: 'Grouped notification' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Grouped notification',
      group: 'MyGroup',
    })
  })

  it('should handle url parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?url=https://example.com',
      { title: 'Click to open' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Click to open',
      url: 'https://example.com',
    })
  })

  it('should handle icon parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?icon=https://example.com/icon.png',
      { title: 'Custom icon' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Custom icon',
      icon: 'https://example.com/icon.png',
    })
  })

  it('should handle sound parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?sound=alarm',
      { title: 'Alert!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Alert!',
      sound: 'alarm',
    })
  })

  it('should handle call parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?call=1',
      { title: 'Continuous ringtone' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Continuous ringtone',
      call: '1',
    })
  })

  it('should handle level parameter - active', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?level=active',
      { title: 'Active notification' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Active notification',
      level: 'active',
    })
  })

  it('should handle level parameter - timeSensitive', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?level=timeSensitive',
      { title: 'Time sensitive' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Time sensitive',
      level: 'timeSensitive',
    })
  })

  it('should handle level parameter - passive', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?level=passive',
      { title: 'Passive notification' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Passive notification',
      level: 'passive',
    })
  })

  it('should handle level parameter - critical', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?level=critical',
      { title: 'Critical alert' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Critical alert',
      level: 'critical',
    })
  })

  it('should handle volume parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?volume=10&level=critical',
      { title: 'Loud alert' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Loud alert',
      level: 'critical',
      volume: '10',
    })
  })

  it('should handle badge parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?badge=5',
      { title: 'Badge count' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Badge count',
      badge: 5,
    })
  })

  it('should handle autoCopy parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?autoCopy=1',
      { title: 'Auto copy enabled' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Auto copy enabled',
      autoCopy: '1',
    })
  })

  it('should handle copy parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?copy=Text%20to%20copy',
      { title: 'Copy text' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Copy text',
      copy: 'Text to copy',
    })
  })

  it('should handle action parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?action=none',
      { title: 'No action on tap' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'No action on tap',
      action: 'none',
    })
  })

  it('should handle isArchive parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?isArchive=1',
      { title: 'Archive this' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Archive this',
      isArchive: '1',
    })
  })

  it('should handle ciphertext parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?ciphertext=encryptedData123',
      { title: 'Encrypted' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      markdown: 'Encrypted',
      ciphertext: 'encryptedData123',
    })
  })

  it('should handle multiple query parameters', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await bark.send(
      'bark://api.day.app/myDeviceKey?subtitle=Subtitle&group=alerts&sound=alarm&level=timeSensitive&badge=3&url=https://example.com&icon=https://example.com/icon.png',
      { title: 'Complex notification', body: 'With many options' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      device_keys: ['myDeviceKey'],
      title: 'Complex notification',
      markdown: 'With many options',
      subtitle: 'Subtitle',
      group: 'alerts',
      sound: 'alarm',
      level: 'timeSensitive',
      badge: 3,
      url: 'https://example.com',
      icon: 'https://example.com/icon.png',
    })
  })
})

describe('bark validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw an error if device key is missing', async () => {
    await expect(bark.send(
      'bark://api.day.app',
      { title: 'No device key' },
    )).rejects.toThrow('Device key is required')
  })

  it('should throw an error for invalid level value', async () => {
    await expect(bark.send(
      'bark://api.day.app/myDeviceKey?level=invalid',
      { title: 'Invalid level' },
    )).rejects.toThrow('Invalid Bark query parameters')
  })

  it('should throw an error for invalid call value', async () => {
    await expect(bark.send(
      'bark://api.day.app/myDeviceKey?call=yes',
      { title: 'Invalid call' },
    )).rejects.toThrow('Invalid Bark query parameters')
  })

  it('should throw an error for invalid action value', async () => {
    await expect(bark.send(
      'bark://api.day.app/myDeviceKey?action=invalid',
      { title: 'Invalid action' },
    )).rejects.toThrow('Invalid Bark query parameters')
  })

  it('should throw an error for invalid autoCopy value', async () => {
    await expect(bark.send(
      'bark://api.day.app/myDeviceKey?autoCopy=yes',
      { title: 'Invalid autoCopy' },
    )).rejects.toThrow('Invalid Bark query parameters')
  })

  it('should throw an error for invalid isArchive value', async () => {
    await expect(bark.send(
      'bark://api.day.app/myDeviceKey?isArchive=true',
      { title: 'Invalid isArchive' },
    )).rejects.toThrow('Invalid Bark query parameters')
  })
})
