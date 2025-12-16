import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/browser.ts'],
  target: 'es2020',
  clean: true,
  dts: true,
  alias: {
    '#': fileURLToPath(new URL('./src', import.meta.url)),
  },
  platform: 'neutral',
})
