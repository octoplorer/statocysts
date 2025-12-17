import { defineProvider } from '#/core/provider'
import { assert } from '#/utils/assert'

export const slackProvider = defineProvider('slack:', {
  extractor: (url) => {
    assert(url.hostname === 'bot' || url.hostname === 'webhook', `Invalid slack URL: ${url.toString()}`)
    return {
      type: url.hostname,
    }
  },
  createRequest() {
    const { type } = this.data
    if (type === 'bot') {
      const { username: channel, password: token } = this.url
      return new Request('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel,
          text: this.message,
        }),
      })
    }
    const hookUrl = new URL(`https://hooks.slack.com/services${this.url.pathname}`)
    return new Request(hookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: this.message,
      }),
    })
  },
})
