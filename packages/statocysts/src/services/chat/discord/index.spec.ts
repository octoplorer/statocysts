import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '#/core/transports/http'
import { discord } from '.'

// Mock httpTransport
vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

describe('discord', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request with title only', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456789012345678901234567890')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      content: 'Hello, world!',
    })
  })

  it('should build a request with title and body', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456789012345678901234567890')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      content: '## Test Title\n\nThis is the message body',
    })
  })

  it('should include avatar_url when provided in query', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook?avatar_url=https://example.com/avatar.png',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      content: 'Hello',
      avatar_url: 'https://example.com/avatar.png',
    })
  })

  it('should include username when provided in query', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook?username=CustomBot',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      content: 'Hello',
      username: 'CustomBot',
    })
  })

  it('should add wait parameter to URL when provided', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook?wait=true',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456789012345678901234567890?wait=true')
    expect(await req.json()).toEqual({
      content: 'Hello',
    })
  })

  it('should handle wait=false parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook?wait=false',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    // wait=false should not add the query parameter
    expect(req.url).toBe('https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456789012345678901234567890')
  })

  it('should handle wait=0 parameter', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook?wait=0',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    // wait=0 should not add the query parameter
    expect(req.url).toBe('https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456789012345678901234567890')
  })

  it('should not add wait parameter when not provided', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    // when wait is not provided, it should not add the query parameter
    expect(req.url).toBe('https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456789012345678901234567890')
  })

  it('should combine multiple query parameters', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook?username=CustomBot&avatar_url=https://example.com/avatar.png&wait=true',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz123456789012345678901234567890?wait=true')
    expect(await req.json()).toEqual({
      content: 'Hello',
      username: 'CustomBot',
      avatar_url: 'https://example.com/avatar.png',
    })
  })

  it('should throw an error if webhook ID is missing', async () => {
    await expect(discord.send(
      'discord://:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Webhook ID is required')
  })

  it('should throw an error if webhook token is missing', async () => {
    await expect(discord.send(
      'discord://123456789012345678:@webhook',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Webhook token is required')
  })

  it('should throw an error for invalid hostname', async () => {
    await expect(discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@invalid',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Invalid discord URL')
  })

  it('should handle URL-encoded characters in avatar_url', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook?avatar_url=https%3A%2F%2Fexample.com%2Favatar.png',
      { title: 'Hello' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      content: 'Hello',
      avatar_url: 'https://example.com/avatar.png',
    })
  })

  it('should pass fetchOptions when provided', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await discord.send(
      'discord://123456789012345678:abcdefghijklmnopqrstuvwxyz123456789012345678901234567890@webhook',
      { title: 'Hello' },
      { fetchOptions: { timeout: 5000 } },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    expect(callArgs.fetchOptions).toEqual({ timeout: 5000 })
  })
})
