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
            { slug: 'providers/slack' },
            { slug: 'providers/discord' },
            { slug: 'providers/lark' },
            { slug: 'providers/qq-bot' },
            { slug: 'providers/telegram' },
            { slug: 'providers/bark' },
            { slug: 'providers/server-chan' },
            { slug: 'providers/email' },
            { slug: 'providers/json' },
            { slug: 'providers/logger' },
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
