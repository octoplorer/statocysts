import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import starlightLinksValidator from 'starlight-links-validator'
import starlightSidebarTopics from 'starlight-sidebar-topics'
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
        starlightSidebarTopics([
          {
            label: { 'en': 'Guides', 'zh-CN': '指南' },
            link: '/getting-started/',
            icon: 'open-book',
            items: [
              {
                label: 'Guide',
                translations: { 'zh-CN': '指南' },
                items: [
                  { slug: 'getting-started' },
                  { slug: 'guide/core-concepts' },
                  { slug: 'guide/sending-notifications' },
                  { slug: 'guide/browser' },
                  { slug: 'guide/error-handling' },
                  { slug: 'guide/security' },
                  { slug: 'guide/troubleshooting' },
                ],
              },
              {
                label: 'Recipes',
                translations: { 'zh-CN': '配方' },
                items: [
                  { slug: 'recipes/github-actions' },
                  { slug: 'recipes/multi-target-delivery' },
                  { slug: 'recipes/browser-proxy' },
                ],
              },
            ],
          },
          {
            label: { 'en': 'Providers', 'zh-CN': '通知提供方' },
            link: '/providers/',
            icon: 'puzzle',
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
            label: { 'en': 'Reference', 'zh-CN': '参考' },
            link: '/reference/api/',
            icon: 'document',
            items: [
              { slug: 'reference/api' },
              { slug: 'reference/cli' },
              { slug: 'reference/compatibility' },
            ],
          },
        ]),
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
    }),
  ],
})
