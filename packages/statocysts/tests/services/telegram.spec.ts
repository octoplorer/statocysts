/// <reference types="vitest/importMeta" />
import type { FetchOptions, FetchResponse } from 'ofetch'
import { describe, expect, it } from 'vitest'
import { telegram } from '#/index'

interface TelegramApiResponse {
  ok: boolean
  result: {
    chat: {
      id: number
      type?: string
    }
    text: string
    entities?: Array<{
      type: string
      offset: number
      length: number
    }>
  }
}

describe('telegram integration test', () => {
  async function sendAndGetResponse(url: string, message: { title: string, body?: string }) {
    return new Promise<FetchResponse<TelegramApiResponse>>((resolve) => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => resolve(response),
      }
      telegram.send(url, message, { fetchOptions })
    })
  }

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should send a simple message to telegram',
    async () => {
      const response = await sendAndGetResponse(
        process.env.VITE_TELEGRAM_TEST_URL!,
        { title: 'Hello, Telegram!' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          chat: expect.objectContaining({
            id: expect.any(Number),
          }),
          text: 'Hello, Telegram!',
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should send a message with title and body',
    async () => {
      const response = await sendAndGetResponse(
        process.env.VITE_TELEGRAM_TEST_URL!,
        { title: 'Test Title', body: 'This is the message body' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          text: expect.stringMatching(/Test Title[\s\S]*This is the message body/),
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should send a message with Markdown formatting',
    async () => {
      const response = await sendAndGetResponse(
        `${process.env.VITE_TELEGRAM_TEST_URL!}?parse_mode=Markdown`,
        { title: 'Markdown Title', body: 'Message with *bold* and _italic_ text' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          text: 'Markdown Title\n\nMessage with bold and italic text',
          entities: expect.arrayContaining([
            expect.objectContaining({ type: 'bold', offset: 0, length: 14 }),
            expect.objectContaining({ type: 'bold' }),
            expect.objectContaining({ type: 'italic' }),
          ]),
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should send a message with HTML formatting',
    async () => {
      const response = await sendAndGetResponse(
        `${process.env.VITE_TELEGRAM_TEST_URL!}?parse_mode=HTML`,
        { title: 'HTML Title', body: 'Message with special chars: <>&' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          text: expect.stringMatching(/HTML Title[\s\S]*Message with special chars: <>&/),
          entities: expect.arrayContaining([
            expect.objectContaining({ type: 'bold', offset: 0, length: 10 }),
          ]),
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should send a message with MarkdownV2 formatting',
    async () => {
      const response = await sendAndGetResponse(
        `${process.env.VITE_TELEGRAM_TEST_URL!}?parse_mode=MarkdownV2`,
        { title: 'MarkdownV2 Title', body: 'Message body' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          text: expect.stringContaining('MarkdownV2 Title'),
          entities: expect.arrayContaining([
            expect.objectContaining({ type: 'bold', offset: 0, length: 16 }),
          ]),
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should escape special characters in MarkdownV2 title',
    async () => {
      const response = await sendAndGetResponse(
        `${process.env.VITE_TELEGRAM_TEST_URL!}?parse_mode=MarkdownV2`,
        { title: 'Title_with-special.chars!', body: 'Body text' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          text: expect.stringContaining('Title_with-special.chars!'),
          entities: expect.arrayContaining([
            expect.objectContaining({ type: 'bold', offset: 0 }),
          ]),
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should handle HTML special characters in title',
    async () => {
      const response = await sendAndGetResponse(
        `${process.env.VITE_TELEGRAM_TEST_URL!}?parse_mode=HTML`,
        { title: 'Title <with> & special', body: 'Body text' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          text: expect.stringContaining('Title <with> & special'),
          entities: expect.arrayContaining([
            expect.objectContaining({ type: 'bold', offset: 0 }),
          ]),
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should handle complex MarkdownV2 special characters',
    async () => {
      const response = await sendAndGetResponse(
        `${process.env.VITE_TELEGRAM_TEST_URL!}?parse_mode=MarkdownV2`,
        { title: 'Test_*[]()~`>#+-=|{}.!', body: 'Body' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          text: expect.stringContaining('Test'),
          entities: expect.arrayContaining([
            expect.objectContaining({ type: 'bold', offset: 0 }),
          ]),
        }),
      }))
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_CHANNEL_TEST_URL === undefined)(
    'should send a message to a channel',
    async () => {
      const response = await sendAndGetResponse(
        process.env.VITE_TELEGRAM_CHANNEL_TEST_URL!,
        { title: 'Channel message' },
      )

      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        ok: true,
        result: expect.objectContaining({
          chat: expect.objectContaining({
            type: 'channel',
          }),
          text: 'Channel message',
        }),
      }))
    },
  )
})
