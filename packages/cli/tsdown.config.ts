import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/cli.ts'],
  target: 'node18',
  clean: true,
  dts: false,
  platform: 'node',
})
