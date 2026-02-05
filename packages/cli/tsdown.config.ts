import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/cli.ts', './src/index.ts'],
  target: 'node20',
  clean: true,
  dts: true,
  platform: 'node',
  shims: true,
  publint: 'ci-only',
  attw: 'ci-only',
})
