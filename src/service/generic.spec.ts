import { describe, expect, it } from "vitest";
import { buildGenericRequest } from "./generic";

describe('generic', () => {
  it('should build a request with default options', async () => {
    const request = buildGenericRequest(
      new URL('generic://localhost:3000'),
      'Hello, world!'
    )
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(await request.json()).toEqual({
      message: 'Hello, world!',
    })
  })

  it('should build a request with properties syntax', async () => {
    const request = buildGenericRequest(
      new URL('generic://localhost:3000/#$title=title'),
      'Hello, world!'
    )
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(await request.json()).toEqual({
      message: 'Hello, world!',
      title: 'title',
    })
  })

  it('should build a request with plaintext template', async () => {
    const request = buildGenericRequest(
      new URL('generic://localhost:3000/#template=plaintext'),
      'Hello, world!'
    )
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('text/plain')
    expect(await request.text()).toBe('Hello, world!')
  })

  it('should build a request with custom method', async () => {
    const request = buildGenericRequest(
      new URL('generic://localhost:3000/#method=PUT'),
      'Hello, world!'
    )
    expect(request.method).toBe('PUT')
    expect(request.headers.get('Content-Type')).toBe('application/json')
    expect(await request.json()).toEqual({
      message: 'Hello, world!',
    })
  })

  it('should build a request with custom content type', async () => {
    const request = buildGenericRequest(
      new URL('generic://localhost:3000/#template=plaintext&contentType=application/xml'),
      '<xml>Hello, world!</xml>'
    )
    expect(request.method).toBe('POST')
    expect(request.headers.get('Content-Type')).toBe('application/xml')
    expect(await request.text()).toBe('<xml>Hello, world!</xml>')
  })
})
