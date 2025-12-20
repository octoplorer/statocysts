import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/cli.ts', './src/index.ts'],
  target: 'node18',
  clean: true,
  dts: true,
  platform: 'node',
})
