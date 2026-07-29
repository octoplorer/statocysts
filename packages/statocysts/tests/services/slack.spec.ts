/// <reference types="vitest/importMeta" />
import type { FetchOptions } from 'ofetch'
import { describe, expect, it } from 'vitest'
import { slack } from '#/index'

describe('slack integration test', () => {
  it.skipIf(process.env.VITE_SLACK_BOTAPI_TEST_URL === undefined)(
    'should send a simple message to slack via bot API',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            channel: expect.any(String),
            message: expect.objectContaining({
              app_id: expect.any(String),
              text: 'Hello, world!',
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

  it.skipIf(process.env.VITE_SLACK_BOTAPI_TEST_URL === undefined)(
    'should send a message with markdown body to slack via bot API',
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
                  type: 'header',
                  text: expect.objectContaining({
                    type: 'plain_text',
                    text: 'Test Title',
                  }),
                }),
                expect.objectContaining({
                  type: 'section',
                  text: expect.objectContaining({
                    type: 'mrkdwn',
                    text: '*Bold text* and _italic text_',
                  }),
                }),
              ]),
              text: 'Test Title',
            }),
          }))
        },
      }
      await slack.send(
        process.env.VITE_SLACK_BOTAPI_TEST_URL!,
        { title: 'Test Title', body: '*Bold text* and _italic text_' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_SLACK_WEBHOOK_TEST_URL === undefined)(
    'should send a simple message to slack via webhook',
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

  it.skipIf(process.env.VITE_SLACK_WEBHOOK_TEST_URL === undefined)(
    'should send a message with markdown body to slack via webhook',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toBe('ok')
        },
      }
      await slack.send(
        process.env.VITE_SLACK_WEBHOOK_TEST_URL!,
        { title: 'Test Title', body: '*Bold text* and _italic text_' },
        {
          fetchOptions,
        },
      )
    },
  )
})
