import * as v from 'valibot'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { safeParseQuery } from './url'

describe('safeParseQuery', () => {
  it('parses query parameters with a Valibot schema', () => {
    const schema = v.object({
      name: v.string(),
      age: v.pipe(v.unknown(), v.transform(Number), v.number()),
    })

    const result = safeParseQuery('https://example.com?name=John&age=25', schema)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.output).toEqual({ name: 'John', age: 25 })
      expectTypeOf(result.output).toEqualTypeOf<{ name: string, age: number }>()
    }
  })

  it('accepts a URL object and applies schema defaults', () => {
    const schema = v.object({
      name: v.string(),
      role: v.optional(v.string(), 'user'),
    })

    const result = safeParseQuery(new URL('https://example.com?name=Jane'), schema)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.output).toEqual({ name: 'Jane', role: 'user' })
    }
  })

  it('preserves repeated query parameters for array schemas', () => {
    const schema = v.object({
      tags: v.array(v.string()),
    })

    const result = safeParseQuery('https://example.com?tags=foo&tags=bar&tags=baz', schema)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.output).toEqual({ tags: ['foo', 'bar', 'baz'] })
    }
  })

  it('returns validation issues instead of throwing', () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email()),
      age: v.pipe(v.unknown(), v.transform(Number), v.number(), v.maxValue(150)),
    })

    const result = safeParseQuery('https://example.com?email=invalid&age=200', schema)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0)
    }
  })

  it('reports missing required query parameters', () => {
    const schema = v.object({
      name: v.string(),
      email: v.pipe(v.string(), v.email()),
    })

    const result = safeParseQuery('https://example.com?name=John', schema)

    expect(result.success).toBe(false)
  })
})
