/// <reference types="vitest/importMeta" />
import type { FetchOptions } from 'ofetch'
import { telegram } from '#/index'
import { describe, expect, it } from 'vitest'

describe('telegram integration test', () => {
  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should send a simple message to telegram',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
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
      }
      await telegram.send(
        process.env.VITE_TELEGRAM_TEST_URL!,
        { title: 'Hello, Telegram!' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_TEST_URL === undefined)(
    'should send a message with title and body',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            ok: true,
            result: expect.objectContaining({
              text: expect.stringMatching(/Test Title[\s\S]*This is the message body/),
            }),
          }))
        },
      }
      await telegram.send(
        process.env.VITE_TELEGRAM_TEST_URL!,
        { title: 'Test Title', body: 'This is the message body' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_MARKDOWN_TEST_URL === undefined)(
    'should send a message with Markdown formatting',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            ok: true,
            result: expect.objectContaining({
              text: '*Markdown Title*\n\nMessage with *bold* and _italic_ text',
            }),
          }))
        },
      }
      await telegram.send(
        process.env.VITE_TELEGRAM_MARKDOWN_TEST_URL!,
        { title: 'Markdown Title', body: 'Message with *bold* and _italic_ text' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_HTML_TEST_URL === undefined)(
    'should send a message with HTML formatting',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            ok: true,
            result: expect.objectContaining({
              text: '<b>HTML Title</b>\n\nMessage with <b>bold</b> and <i>italic</i> text',
            }),
          }))
        },
      }
      await telegram.send(
        process.env.VITE_TELEGRAM_HTML_TEST_URL!,
        { title: 'HTML Title', body: 'Message with <b>bold</b> and <i>italic</i> text' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_MARKDOWNV2_TEST_URL === undefined)(
    'should send a message with MarkdownV2 formatting',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            ok: true,
            result: expect.objectContaining({
              text: expect.stringContaining('MarkdownV2 Title'),
            }),
          }))
        },
      }
      await telegram.send(
        process.env.VITE_TELEGRAM_MARKDOWNV2_TEST_URL!,
        { title: 'MarkdownV2 Title', body: 'Message body' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_TELEGRAM_CHANNEL_TEST_URL === undefined)(
    'should send a message to a channel',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
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
      }
      await telegram.send(
        process.env.VITE_TELEGRAM_CHANNEL_TEST_URL!,
        { title: 'Channel message' },
        {
          fetchOptions,
        },
      )
    },
  )
})
