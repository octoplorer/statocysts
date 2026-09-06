import process from 'node:process'
import { run } from './index'

run().then((code) => {
  process.exitCode = code
})
