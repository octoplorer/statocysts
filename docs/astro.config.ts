import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://octoplorer.github.io',
  base: '/statocysts',
  integrations: [
    starlight({
      title: 'Statocysts',
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
          items: [{ slug: 'getting-started' }],
        },
      ],
    }),
  ],
})
