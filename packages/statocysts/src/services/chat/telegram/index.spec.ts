import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '#/core/transports/http'
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
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321',
      { title: 'Hello, world!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/sendMessage')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: 'Hello, world!',
      parse_mode: undefined,
    })
  })

  it('should build a request with title and body in Markdown mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=Markdown',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.method).toBe('POST')
    expect(req.url).toBe('https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/sendMessage')
    expect(req.headers.get('Content-Type')).toBe('application/json')
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: '*Test Title*\n\nThis is the message body',
      parse_mode: 'Markdown',
    })
  })

  it('should build a request with title and body in HTML mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=HTML',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: '<b>Test Title</b>\n\nThis is the message body',
      parse_mode: 'HTML',
    })
  })

  it('should escape special characters in HTML mode for both title and body', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=HTML',
      { title: 'Test <Title>', body: 'Body with <b>bold</b> & "special" chars' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    // Both title and body are escaped in HTML mode
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: '<b>Test &lt;Title&gt;</b>\n\nBody with &lt;b&gt;bold&lt;/b&gt; &amp; "special" chars',
      parse_mode: 'HTML',
    })
  })

  it('should build a request with title and body in MarkdownV2 mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=MarkdownV2',
      { title: 'Test Title', body: 'This is the message body' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: '*Test Title*\n\nThis is the message body',
      parse_mode: 'MarkdownV2',
    })
  })

  it('should escape special characters in MarkdownV2 mode for both title and body', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=MarkdownV2',
      { title: 'Test_Title-With.Special!Chars', body: 'Body_with-special.chars!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    // Both title and body are escaped in MarkdownV2 mode
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: '*Test\\_Title\\-With\\.Special\\!Chars*\n\nBody\\_with\\-special\\.chars\\!',
      parse_mode: 'MarkdownV2',
    })
  })

  it('should handle channel username with @ symbol', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/@mychannel',
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
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/%40mychannel',
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

  it('should handle channel numeric ID', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/-1001234567890',
      { title: 'Channel message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '-1001234567890',
      text: 'Channel message',
      parse_mode: undefined,
    })
  })

  it('should handle title only without body in different parse modes', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=Markdown',
      { title: 'Simple title' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: 'Simple title',
      parse_mode: 'Markdown',
    })
  })

  it('should escape special characters when no body in MarkdownV2 mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=MarkdownV2',
      { title: 'Title_with-special.chars!' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: 'Title\\_with\\-special\\.chars\\!',
      parse_mode: 'MarkdownV2',
    })
  })

  it('should escape special characters when no body in HTML mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=HTML',
      { title: 'Title <with> & special' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '987654321',
      text: 'Title &lt;with&gt; &amp; special',
      parse_mode: 'HTML',
    })
  })

  it('should throw an error if chat ID is missing', async () => {
    await expect(telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot',
      { title: 'Hello, world!' },
    )).rejects.toThrow('At least one chat ID is required')
  })

  it('should throw an error if bot token is missing', async () => {
    await expect(telegram.send(
      'telegram://@bot/987654321',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Bot token is required')
  })

  it('should throw an error for invalid hostname', async () => {
    await expect(telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@invalid/987654321',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Invalid telegram URL')
  })

  it('should throw an error for invalid parse_mode', async () => {
    await expect(telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321?parse_mode=InvalidMode',
      { title: 'Hello, world!' },
    )).rejects.toThrow('Invalid telegram query')
  })

  it('should use custom API base URL when provided', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/987654321',
      { title: 'Hello' },
      { apiBaseUrl: 'https://custom.telegram.org' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(req.url).toBe('https://custom.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/sendMessage')
  })

  it('should handle message thread ID for forum topics', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/-1001234567890:42',
      { title: 'Topic message' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '-1001234567890',
      text: 'Topic message',
      parse_mode: undefined,
      message_thread_id: 42,
    })
  })

  it('should handle message thread ID with body and parse mode', async () => {
    vi.mocked(http.send).mockResolvedValue(undefined)

    await telegram.send(
      'telegram://123456789:ABCdefGHIjklMNOpqrsTUVwxyz@bot/-1001234567890:42?parse_mode=Markdown',
      { title: 'Topic Title', body: 'Topic body content' },
    )

    expect(http.send).toHaveBeenCalledTimes(1)
    const callArgs = vi.mocked(http.send).mock.calls[0][0]
    const req = callArgs.request
    expect(await req.json()).toEqual({
      chat_id: '-1001234567890',
      text: '*Topic Title*\n\nTopic body content',
      parse_mode: 'Markdown',
      message_thread_id: 42,
    })
  })
})
