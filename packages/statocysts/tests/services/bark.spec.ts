import type { FetchOptions } from 'ofetch'
import { bark } from '#/index'
import { describe, expect, it } from 'vitest'

describe('bark integration test', () => {
  const skipCondition = process.env.VITE_BARK_TEST_URL === undefined

  const expectSuccessResponse: FetchOptions = {
    onResponse: ({ response }) => {
      expect(response.status).toBe(200)
      expect(response._data).toEqual(expect.objectContaining({
        code: 200,
        message: 'success',
        data: expect.arrayContaining([
          expect.objectContaining({
            device_key: expect.any(String),
            code: 200,
          }),
        ]),
        timestamp: expect.any(Number),
      }))
    },
  }

  it.skipIf(skipCondition)(
    'should send a simple message to bark',
    async () => {
      await bark.send(
        process.env.VITE_BARK_TEST_URL!,
        { title: 'Hello, world!' },
        { fetchOptions: expectSuccessResponse },
      )
    },
  )

  it.skipIf(skipCondition)(
    'should send markdown content with title and body',
    async () => {
      await bark.send(
        process.env.VITE_BARK_TEST_URL!,
        {
          title: 'Markdown Test',
          body: '## Heading\n- Item 1\n- Item 2\n\n**Bold** and *italic* text',
        },
        { fetchOptions: expectSuccessResponse },
      )
    },
  )

  it.skipIf(skipCondition)(
    'should handle special markdown symbols',
    async () => {
      await bark.send(
        process.env.VITE_BARK_TEST_URL!,
        {
          title: 'Special Symbols Test',
          body: '`code` and ```block```\n> quote\n[link](https://example.com)\n![image](https://example.com/img.png)',
        },
        { fetchOptions: expectSuccessResponse },
      )
    },
  )

  it.skipIf(skipCondition)(
    'should handle special characters and punctuation',
    async () => {
      await bark.send(
        process.env.VITE_BARK_TEST_URL!,
        {
          title: 'Punctuation & Symbols',
          body: '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\~`',
        },
        { fetchOptions: expectSuccessResponse },
      )
    },
  )

  it.skipIf(skipCondition)(
    'should handle unicode and emoji characters',
    async () => {
      await bark.send(
        process.env.VITE_BARK_TEST_URL!,
        {
          title: '中文标题 🎉',
          body: '中文内容测试\n日本語テスト\n한국어 테스트\n🚀 🔥 ✅ ❌ ⚠️',
        },
        { fetchOptions: expectSuccessResponse },
      )
    },
  )

  it.skipIf(skipCondition)(
    'should handle newlines and whitespace',
    async () => {
      await bark.send(
        process.env.VITE_BARK_TEST_URL!,
        {
          title: 'Whitespace Test',
          body: 'Line 1\n\nLine 2\n\n\nLine 3\n\tTabbed\n  Spaced',
        },
        { fetchOptions: expectSuccessResponse },
      )
    },
  )
})
