import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'
import starlightThemeRapide from 'starlight-theme-rapide'

export default defineConfig({
  site: 'https://octoplorer.github.io',
  base: '/statocysts',
  integrations: [
    starlight({
      title: 'Statocysts',
      logo: {
        src: './src/assets/logo.svg',
      },
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            content: 'https://octoplorer.github.io/statocysts/og.png',
          },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:alt', content: 'Statocysts documentation' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:width', content: '1200' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:height', content: '630' },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'twitter:image',
            content: 'https://octoplorer.github.io/statocysts/og.png',
          },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image:alt', content: 'Statocysts documentation' },
        },
      ],
      plugins: [
        starlightThemeRapide(),
        starlightLinksValidator({
          errorOnInconsistentLocale: true,
          sameSitePolicy: 'error',
        }),
      ],
      defaultLocale: 'root',
      locales: {
        'root': { label: 'English', lang: 'en' },
        'zh-hans': { label: '简体中文', lang: 'zh-CN' },
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/octoplorer/statocysts',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/octoplorer/statocysts/edit/master/docs/',
      },
      sidebar: [
        {
          label: 'Guide',
          translations: { 'zh-CN': '指南' },
          items: [
            { slug: 'getting-started' },
            { slug: 'guide/core-concepts' },
            { slug: 'guide/sending-notifications' },
            { slug: 'guide/browser' },
            { slug: 'guide/error-handling' },
          ],
        },
        {
          label: 'Providers',
          translations: { 'zh-CN': '通知提供方' },
          items: [
            { slug: 'providers' },
            {
              label: 'Chat',
              translations: { 'zh-CN': '即时通讯' },
              collapsed: true,
              items: [
                { slug: 'providers/slack' },
                { slug: 'providers/discord' },
                { slug: 'providers/lark' },
                { slug: 'providers/qq-bot' },
                { slug: 'providers/telegram' },
              ],
            },
            {
              label: 'Push',
              translations: { 'zh-CN': '推送服务' },
              collapsed: true,
              items: [
                { slug: 'providers/bark' },
                { slug: 'providers/server-chan' },
              ],
            },
            {
              label: 'Specialized',
              translations: { 'zh-CN': '专用集成' },
              collapsed: true,
              items: [
                { slug: 'providers/email' },
                { slug: 'providers/json' },
                { slug: 'providers/logger' },
              ],
            },
          ],
        },
        {
          label: 'Reference',
          translations: { 'zh-CN': '参考' },
          items: [
            { slug: 'reference/api' },
            { slug: 'reference/cli' },
          ],
        },
      ],
    }),
  ],
})
