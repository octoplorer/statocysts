import process from 'node:process'
import { run } from './index.js'

run().then((code) => {
  process.exitCode = code
})
