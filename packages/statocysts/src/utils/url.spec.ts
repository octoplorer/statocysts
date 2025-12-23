import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { getValidateQuery } from './url'

describe('getValidateQuery', () => {
  it('should parse and validate query params with zod schema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.coerce.number(),
    })

    const url = 'https://example.com?name=John&age=25'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ name: 'John', age: 25 })
  })

  it('should work with URL object', () => {
    const schema = z.object({
      name: z.string(),
      age: z.coerce.number(),
    })

    const url = new URL('https://example.com?name=Jane&age=30')
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ name: 'Jane', age: 30 })
  })

  it('should handle optional fields with zod', () => {
    const schema = z.object({
      name: z.string(),
      age: z.coerce.number().optional(),
      email: z.string().email().optional(),
    })

    const url = 'https://example.com?name=Alice'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ name: 'Alice' })
  })

  it('should handle default values with zod', () => {
    const schema = z.object({
      name: z.string(),
      role: z.string().default('user'),
      isActive: z.coerce.boolean().default(true),
    })

    const url = 'https://example.com?name=Bob'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ name: 'Bob', role: 'user', isActive: true })
  })

  it('should validate array query params', () => {
    const schema = z.object({
      tags: z.array(z.string()),
    })

    const url = 'https://example.com?tags=foo&tags=bar&tags=baz'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ tags: ['foo', 'bar', 'baz'] })
  })

  it('should handle complex nested schemas', () => {
    const schema = z.object({
      user: z.string(),
      settings: z.object({
        theme: z.enum(['light', 'dark']).default('light'),
        notifications: z.coerce.boolean().default(true),
      }).optional().default({ theme: 'light', notifications: true }),
    })

    const url = 'https://example.com?user=admin'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({
      user: 'admin',
      settings: { theme: 'light', notifications: true },
    })
  })

  it('should throw validation error for invalid data', () => {
    const schema = z.object({
      age: z.coerce.number().min(18),
    })

    const url = 'https://example.com?age=15'

    expect(() => {
      getValidateQuery(url, data => schema.parse(data))
    }).toThrow()
  })

  it('should throw error for missing required fields', () => {
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const url = 'https://example.com?name=John'

    expect(() => {
      getValidateQuery(url, data => schema.parse(data))
    }).toThrow()
  })

  it('should handle safeParse for graceful error handling', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.coerce.number().min(0).max(150),
    })

    const url = 'https://example.com?email=invalid&age=200'
    const result = getValidateQuery(url, data => schema.safeParse(data))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(z.ZodError)
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
    const schema = z.object({}).passthrough()

    const url = 'https://example.com'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({})
  })

  it('should handle number coercion', () => {
    const schema = z.object({
      page: z.coerce.number().int().positive(),
      limit: z.coerce.number().int().positive().max(100),
      price: z.coerce.number(),
    })

    const url = 'https://example.com?page=2&limit=50&price=99.99'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ page: 2, limit: 50, price: 99.99 })
  })

  it('should handle boolean coercion', () => {
    const schema = z.object({
      isActive: z.coerce.boolean(),
      hasAccess: z.coerce.boolean(),
    })

    const url = 'https://example.com?isActive=true&hasAccess=1'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ isActive: true, hasAccess: true })
  })

  it('should handle enum validation', () => {
    const schema = z.object({
      status: z.enum(['active', 'inactive', 'pending']),
      priority: z.enum(['low', 'medium', 'high']),
    })

    const url = 'https://example.com?status=active&priority=high'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({ status: 'active', priority: 'high' })
  })

  it('should throw error for invalid enum value', () => {
    const schema = z.object({
      status: z.enum(['active', 'inactive']),
    })

    const url = 'https://example.com?status=unknown'

    expect(() => {
      getValidateQuery(url, data => schema.parse(data))
    }).toThrow()
  })

  it('should transform data after validation', () => {
    const schema = z.object({
      date: z.string().transform(val => new Date(val)),
      amount: z.coerce.number().transform(val => val * 100),
    })

    const url = 'https://example.com?date=2023-01-01&amount=10.5'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result.date).toBeInstanceOf(Date)
    expect(result.amount).toBe(1050)
  })

  it('should work with zod refine for custom validation', () => {
    const schema = z.object({
      password: z.string().min(8),
      confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
    })

    const url = 'https://example.com?password=secret123&confirmPassword=secret123'
    const result = getValidateQuery(url, data => schema.parse(data))

    expect(result).toEqual({
      password: 'secret123',
      confirmPassword: 'secret123',
    })
  })

  it('should throw error when refine validation fails', () => {
    const schema = z.object({
      password: z.string(),
      confirmPassword: z.string(),
    }).refine(data => data.password === data.confirmPassword)

    const url = 'https://example.com?password=pass1&confirmPassword=pass2'

    expect(() => {
      getValidateQuery(url, data => schema.parse(data))
    }).toThrow()
  })
})
