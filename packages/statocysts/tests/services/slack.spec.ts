/// <reference types="vitest/importMeta" />
import type { FetchOptions } from 'ofetch'
import { slack } from '#/index'
import { describe, expect, it } from 'vitest'

describe('slack integration test', () => {
  it.skipIf(process.env.VITE_SLACK_BOTAPI_TEST_URL === undefined)(
    'should send a message to slack via bot API',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            channel: expect.any(String),
            message: expect.objectContaining({
              app_id: expect.any(String),
              blocks: expect.arrayContaining([
                expect.objectContaining({
                  block_id: expect.any(String),
                  elements: expect.arrayContaining([
                    expect.objectContaining({
                      elements: expect.arrayContaining([
                        expect.objectContaining({
                          text: 'Hello, world!',
                          type: 'text',
                        }),
                      ]),
                    }),
                  ]),
                }),
              ]),
            }),
          }))
        },
      }
      await slack.send(
        process.env.VITE_SLACK_BOTAPI_TEST_URL!,
        { title: 'Hello, world!' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_SLACK_WEBHOOK_TEST_URL === undefined)(
    'should send a message to slack via webhook',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBe('ok')
        },
      }
      await slack.send(
        process.env.VITE_SLACK_WEBHOOK_TEST_URL!,
        { title: 'Hello, world!' },
        {
          fetchOptions,
        },
      )
    },
  )
})
