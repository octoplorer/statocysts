import { defineProvider } from '#/shared'

export const serverChan = defineProvider('server-chan:', {
  createRequest(ctx) {
    const url = new URL(`${ctx.url.pathname}.send`, 'https://sctapi.ftqq.com')
    return new Request(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        // title: ctx.title, // TODO: need have title
        desp: ctx.message,
      }),
    })
  },
})
