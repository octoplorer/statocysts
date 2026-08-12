import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { getValidateQuery } from './url'

describe('getValidateQuery', () => {
  it('should parse and validate query params with valibot schema', () => {
    const schema = v.object({
      name: v.string(),
      age: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number()),
    })

    const url = 'https://example.com?name=John&age=25'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ name: 'John', age: 25 })
  })

  it('should work with URL object', () => {
    const schema = v.object({
      name: v.string(),
      age: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number()),
    })

    const url = new URL('https://example.com?name=Jane&age=30')
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ name: 'Jane', age: 30 })
  })

  it('should handle optional fields with valibot', () => {
    const schema = v.object({
      name: v.string(),
      age: v.optional(v.pipe(v.unknown(), v.transform(input => Number(input)), v.number())),
      email: v.optional(v.pipe(v.string(), v.email())),
    })

    const url = 'https://example.com?name=Alice'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ name: 'Alice' })
  })

  it('should handle default values with valibot', () => {
    const schema = v.object({
      name: v.string(),
      role: v.optional(v.string(), 'user'),
      isActive: v.optional(v.pipe(v.unknown(), v.transform(input => Boolean(input)), v.boolean()), true),
    })

    const url = 'https://example.com?name=Bob'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ name: 'Bob', role: 'user', isActive: true })
  })

  it('should validate array query params', () => {
    const schema = v.object({
      tags: v.array(v.string()),
    })

    const url = 'https://example.com?tags=foo&tags=bar&tags=baz'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ tags: ['foo', 'bar', 'baz'] })
  })

  it('should handle complex nested schemas', () => {
    const schema = v.object({
      user: v.string(),
      settings: v.optional(v.object({
        theme: v.optional(v.picklist(['light', 'dark']), 'light'),
        notifications: v.optional(v.pipe(v.unknown(), v.transform(input => Boolean(input)), v.boolean()), true),
      }), { theme: 'light', notifications: true }),
    })

    const url = 'https://example.com?user=admin'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({
      user: 'admin',
      settings: { theme: 'light', notifications: true },
    })
  })

  it('should throw validation error for invalid data', () => {
    const schema = v.object({
      age: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number(), v.minValue(18)),
    })

    const url = 'https://example.com?age=15'

    expect(() => {
      getValidateQuery(url, data => v.parse(schema, data))
    }).toThrow()
  })

  it('should throw error for missing required fields', () => {
    const schema = v.object({
      name: v.string(),
      email: v.pipe(v.string(), v.email()),
    })

    const url = 'https://example.com?name=John'

    expect(() => {
      getValidateQuery(url, data => v.parse(schema, data))
    }).toThrow()
  })

  it('should handle safeParse for graceful error handling', () => {
    const schema = v.object({
      email: v.pipe(v.string(), v.email()),
      age: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number(), v.minValue(0), v.maxValue(150)),
    })

    const url = 'https://example.com?email=invalid&age=200'
    const result = getValidateQuery(url, data => v.safeParse(schema, data))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0)
    }
  })

  it('should work with custom parser function', () => {
    const customParser = (data: unknown) => {
      const params = data as Record<string, string>
      return {
        fullName: `${params.firstName} ${params.lastName}`,
        isAdmin: params.admin === 'true',
      }
    }

    const url = 'https://example.com?firstName=John&lastName=Doe&admin=true'
    const result = getValidateQuery(url, customParser)

    expect(result).toEqual({
      fullName: 'John Doe',
      isAdmin: true,
    })
  })

  it('should handle empty query params', () => {
    const schema = v.looseObject({})

    const url = 'https://example.com'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({})
  })

  it('should handle number coercion', () => {
    const schema = v.object({
      page: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number(), v.integer(), v.gtValue(0)),
      limit: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number(), v.integer(), v.gtValue(0), v.maxValue(100)),
      price: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number()),
    })

    const url = 'https://example.com?page=2&limit=50&price=99.99'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ page: 2, limit: 50, price: 99.99 })
  })

  it('should handle boolean coercion', () => {
    const schema = v.object({
      isActive: v.pipe(v.unknown(), v.transform(input => Boolean(input)), v.boolean()),
      hasAccess: v.pipe(v.unknown(), v.transform(input => Boolean(input)), v.boolean()),
    })

    const url = 'https://example.com?isActive=true&hasAccess=1'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ isActive: true, hasAccess: true })
  })

  it('should handle enum validation', () => {
    const schema = v.object({
      status: v.picklist(['active', 'inactive', 'pending']),
      priority: v.picklist(['low', 'medium', 'high']),
    })

    const url = 'https://example.com?status=active&priority=high'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({ status: 'active', priority: 'high' })
  })

  it('should throw error for invalid enum value', () => {
    const schema = v.object({
      status: v.picklist(['active', 'inactive']),
    })

    const url = 'https://example.com?status=unknown'

    expect(() => {
      getValidateQuery(url, data => v.parse(schema, data))
    }).toThrow()
  })

  it('should transform data after validation', () => {
    const schema = v.object({
      date: v.pipe(v.string(), v.transform(val => new Date(val))),
      amount: v.pipe(v.unknown(), v.transform(input => Number(input)), v.number(), v.transform(val => val * 100)),
    })

    const url = 'https://example.com?date=2023-01-01&amount=10.5'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result.date).toBeInstanceOf(Date)
    expect(result.amount).toBe(1050)
  })

  it('should work with valibot check for custom validation', () => {
    const schema = v.pipe(
      v.object({
        password: v.pipe(v.string(), v.minLength(8)),
        confirmPassword: v.string(),
      }),
      v.check(data => data.password === data.confirmPassword, 'Passwords do not match'),
    )

    const url = 'https://example.com?password=secret123&confirmPassword=secret123'
    const result = getValidateQuery(url, data => v.parse(schema, data))

    expect(result).toEqual({
      password: 'secret123',
      confirmPassword: 'secret123',
    })
  })

  it('should throw error when check validation fails', () => {
    const schema = v.pipe(
      v.object({
        password: v.string(),
        confirmPassword: v.string(),
      }),
      v.check(data => data.password === data.confirmPassword),
    )

    const url = 'https://example.com?password=pass1&confirmPassword=pass2'

    expect(() => {
      getValidateQuery(url, data => v.parse(schema, data))
    }).toThrow()
  })
})
