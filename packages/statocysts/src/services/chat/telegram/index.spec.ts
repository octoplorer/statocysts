import { http } from '#/core/transports/http'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { telegram } from '.'

// Mock httpTransport
vi.mock('#/core/transports/http', () => ({
  http: {
    send: vi.fn(),
  },
}))

describe('telegram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should build a basic request with title only', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.telegram.org/botABCdefGHIjklMNOpqrsTUVwxyz/sendMessage')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      chat_id: '123456789',
      text: 'Hello, world!',
      parse_mode: undefined,
    })
  })

  it('should build a request with title and body in Markdown mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot?parse_mode=Markdown',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.telegram.org/botABCdefGHIjklMNOpqrsTUVwxyz/sendMessage')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      chat_id: '123456789',
      text: '*Test Title*\n\nThis is the message body',
      parse_mode: 'Markdown',
    })
  })

  it('should build a request with title and body in HTML mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot?parse_mode=HTML',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '123456789',
      text: '<b>Test Title</b>\n\nThis is the message body',
      parse_mode: 'HTML',
    })
  })

  it('should build a request with title and body in MarkdownV2 mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot?parse_mode=MarkdownV2',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '123456789',
      text: '*Test Title*\n\nThis is the message body',
      parse_mode: 'MarkdownV2',
    })
  })

  it('should escape special characters in MarkdownV2 mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot?parse_mode=MarkdownV2',
      { title: 'Test_Title-With.Special!Chars', body: 'Body text' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '123456789',
      text: '*Test\\_Title\\-With\\.Special\\!Chars*\n\nBody text',
      parse_mode: 'MarkdownV2',
    })
  })

  it('should handle channel username with @ symbol', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://@mychannel:ABCdefGHIjklMNOpqrsTUVwxyz@bot',
      { title: 'Channel message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '@mychannel',
      text: 'Channel message',
      parse_mode: undefined,
    })
  })

  it('should handle URL-encoded chat ID', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://%40mychannel:ABCdefGHIjklMNOpqrsTUVwxyz@bot',
      { title: 'Encoded channel' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '@mychannel',
      text: 'Encoded channel',
      parse_mode: undefined,
    })
  })

  it('should handle title only without body in different parse modes', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot?parse_mode=Markdown',
      { title: 'Simple title' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '123456789',
      text: 'Simple title',
      parse_mode: 'Markdown',
    })
  })

  it('should throw an error if chat ID is missing', async () => {
    await expect(telegram.send(
      'telegram://:ABCdefGHIjklMNOpqrsTUVwxyz@bot',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Chat ID is required')
  })

  it('should throw an error if bot token is missing', async () => {
    await expect(telegram.send(
      'telegram://123456789:@bot',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Bot token is required')
  })

  it('should throw an error for invalid hostname', async () => {
    await expect(telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@invalid',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Invalid telegram URL')
  })

  it('should throw an error for invalid parse_mode', async () => {
    await expect(telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot?parse_mode=InvalidMode',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Invalid telegram query')
  })

  it('should use custom API base URL when provided', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot',
      { title: 'Hello' },
      { apiBaseUrl: 'https://custom.telegram.org' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://custom.telegram.org/botABCdefGHIjklMNOpqrsTUVwxyz/sendMessage')
  })
})
