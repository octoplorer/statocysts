/// <reference types="vitest/importMeta" />
import type { FetchOptions } from 'ofetch'
import { discord } from '#/index'
import { describe, expect, it } from 'vitest'

describe('discord integration test', () => {
  it.skipIf(process.env.VITE_DISCORD_TEST_URL === undefined)(
    'should send a simple message to discord',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(204)
        },
      }
      await discord.send(
        process.env.VITE_DISCORD_TEST_URL!,
        { title: 'Hello, Discord!' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_DISCORD_TEST_URL === undefined)(
    'should send a message with title and body',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(204)
        },
      }
      await discord.send(
        process.env.VITE_DISCORD_TEST_URL!,
        { title: 'Test Title', body: 'This is the message body' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_DISCORD_TEST_URL === undefined)(
    'should send a message with custom username',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(204)
        },
      }
      const url = new URL(process.env.VITE_DISCORD_TEST_URL!)
      url.searchParams.set('username', 'Custom Bot')
      await discord.send(
        url.toString(),
        { title: 'Message from Custom Bot' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_DISCORD_TEST_URL === undefined)(
    'should send a message with custom avatar',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(204)
        },
      }
      const url = new URL(process.env.VITE_DISCORD_TEST_URL!)
      url.searchParams.set('avatar_url', 'https://fastly.picsum.photos/id/547/200/200.jpg')
      await discord.send(
        url.toString(),
        { title: 'Message with custom avatar' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_DISCORD_WAIT_TEST_URL === undefined)(
    'should send a message with wait parameter and receive response',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(200)
          expect(response._data).toEqual(expect.objectContaining({
            id: expect.any(String),
            channel_id: expect.any(String),
            content: expect.stringContaining('Wait Test'),
            type: 0,
          }))
        },
      }
      await discord.send(
        process.env.VITE_DISCORD_WAIT_TEST_URL!,
        { title: 'Wait Test', body: 'Testing wait parameter' },
        {
          fetchOptions,
        },
      )
    },
  )

  it.skipIf(process.env.VITE_DISCORD_TEST_URL === undefined)(
    'should send a message with custom username and avatar',
    async () => {
      const fetchOptions: FetchOptions = {
        onResponse: ({ response }) => {
          expect(response.status).toBe(204)
        },
      }
      const url = new URL(process.env.VITE_DISCORD_TEST_URL!)
      url.searchParams.set('username', 'Test Bot')
      url.searchParams.set('avatar_url', 'https://fastly.picsum.photos/id/547/200/200.jpg')
      await discord.send(
        url.toString(),
        { title: 'Combined Test', body: 'Custom username and avatar' },
        {
          fetchOptions,
        },
      )
    },
  )
})
