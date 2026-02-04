import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/browser.ts'],
  target: 'es2020',
  clean: true,
  dts: true,
  platform: 'neutral',
  outputOptions: {

  },
})
